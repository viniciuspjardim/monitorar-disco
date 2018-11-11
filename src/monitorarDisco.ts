'use strict';

import cp = require('child_process');
import fs = require('fs');
import iconv = require('iconv-lite');
import path = require('path');
import rimraf = require('rimraf');


export interface Espaco {
    usado: number;
    livre: number;
    total: number;
}

export interface Config {
    unidade: string;
    pastaExecucao: string;
    espacoMinimo: number;
}

export class Ranque {
    public caminho: string = null;
    public importancia: number = 0;

    public toString(): string {
        return `${this.caminho} -> r = ${this.importancia.toFixed(3)}`;
    }
}

export function compararRanque(r1: Ranque, r2: Ranque): number {
    return r1.importancia - r2.importancia;
}

export class MonitorarDisco {

    public static readonly GB: number = 1024 * 1024 * 1024;

    private config: Config;
    private espaco: Espaco;
    private rgxNivel1: RegExp = /^Destino_([a-zA-Z]+)_.+$/ig;
    private rgxNivel3: RegExp = /^F_(([0-9]{4})([0-9]{2})([0-9]{3}))_E([0-9]{5})+$/ig;
    private rgxNivel4: RegExp = /^.*\.DAT$/ig;
    private ranque: Ranque[] = [];
    private logStr: string = '';

    public static main(): void {

        let monitor: MonitorarDisco = new MonitorarDisco();
        let hoje  = new Date();

        monitor.log(`================ ${hoje.getDate()}/${hoje.getMonth()+1}/${hoje.getFullYear()} às ${
            hoje.getHours()}:${hoje.getMinutes()}:${hoje.getSeconds()} ================`);

        monitor.carregarConfig();
        monitor.executar();
    }

    public carregarConfig(): void {
        try {
            const str: string = iconv.decode(fs.readFileSync('config.json'), 'utf8');
            this.config = JSON.parse(str);
            this.log('config.json:');
            this.log(str + '\n');
        }
        catch(e) {
            this.erro(1, e);
        }
    }

    private executar(): void {

        this.calcularEspaco();
        
        if(this.espaco.usado < this.config.espacoMinimo) {

            this.log('\n==== Liberando espaço ====\n');
            this.rank();

            // Após ranquear ordena por importância
            this.ranque.sort(compararRanque);
            this.deleteExec();
        }
        else {
            this.log('Espaço Ok!');
        }

        this.salvarLog();
    }

    /** Percorrendo as pastas de execução da folha e ranqueando por importância */
    private rank(): void {
        try {

            let hoje = new Date();

            // Lendo pastas dentro de (...)/execucao/Emp_01_TOCANTINS/
            let arquivos1: string[] = fs.readdirSync(this.config.pastaExecucao);

            for(let i in arquivos1) {

                let arq1: string = arquivos1[i];
                let path1: string = `${this.config.pastaExecucao}${arq1}`;
                let stat1: fs.Stats = fs.lstatSync(path1);
                let rank1: number = 0;

                if(!stat1.isDirectory()) continue;

                let result1: RegExpExecArray | null = this.rgxNivel1.exec(arq1);
                this.rgxNivel1.lastIndex = 0;
                
                // Pastas de execução de producao tem +100 de importância
                if(result1 !== null && result1[1] === 'producao') {
                    rank1 = 100;
                }
                this.log(`${arq1} -> rank = ${rank1}`);

                // Lendo pastas dentro de (...)/execucao/Emp_01_TOCANTINS/Destino_delta_SRVFVJ/
                let arquivos2: string[] = fs.readdirSync(path1);

                for(let j in arquivos2) {

                    let arq2: string = arquivos2[j];
                    let path2: string = `${this.config.pastaExecucao}${arq1}/${arq2}`;
                    let stat2: fs.Stats = fs.lstatSync(path2);
                    let rank2: number = 0;

                    if(!stat2.isDirectory()) continue;

                    // REAL +50 e ncREAL +25 de importância
                    if(arq2 === 'REAL') {
                        rank2 = 50;
                    }
                    else if(arq2 === 'ncREAL') {
                        rank2 = 25;
                    }
                    this.log(`    ${arq2} -> rank = ${rank2}`);
    
                    // Lendo pastas dentro de (...)/execucao/Emp_01_TOCANTINS/Destino_delta_SRVFVJ/VJ/
                    let arquivos3: string[] = fs.readdirSync(path2);

                    for(let k in arquivos3) {

                        let arq3: string = arquivos3[k];
                        let path3: string = `${this.config.pastaExecucao}${arq1}/${arq2}/${arq3}`;
                        let stat3: fs.Stats = fs.lstatSync(path3);
                        let rank3: number = 0;

                        if(!stat3.isDirectory()) continue;

                        // Lendo pastas dentro de (...)/execucao/Emp_01_TOCANTINS/Destino_delta_SRVFVJ/VJ/F_201808034_E00004/
                        let arquivos4: string[] = fs.readdirSync(path3);

                        for(let l in arquivos4) {

                            let arq4: string = arquivos4[l];
                            let path4: string = `${this.config.pastaExecucao}${arq1}/${arq2}/${arq3}/${arq4}`;
                            let stat4: fs.Stats = fs.lstatSync(path4);
                            

                            let result4: RegExpExecArray | null = this.rgxNivel4.exec(arq4);
                            this.rgxNivel4.lastIndex = 0;

                            if(stat4.isFile() && result4 !== null) {
                                let dias = Math.abs(hoje.getTime() - stat4.mtime.getTime()) / 1000 / 3600 / 24;
                                
                                // Arquivos de menos de 5 dias tem +500
                                if(dias < 5) {
                                    rank3 = 500;
                                }
                                // Mais de 30 tem imporância negativa
                                else if(dias > 30) {
                                    rank3 = -dias / 100;
                                }
                                // De 5 a 30 usa a formula a seguir
                                else {
                                    rank3 = 100 - (dias * 3);
                                }

                                // this.log(`            ${arq4} -> d = ${dias}, r = ${rank3}`);
                                break;
                            }
                        }

                        let rank: Ranque = new Ranque();
                        rank.caminho = path3;
                        rank.importancia = rank1 + rank2 + rank3;

                        this.log(`        ${arq3} -> r = ${rank.importancia.toFixed(3)}`);
                        this.ranque.push(rank);
                    }
                }
            }
            this.log('');
        }
        catch(e) {
            this.erro(4, e);
        }
    }

    /** Percorre o ranque e deleta as pastas de execução com menos importância */
    private deleteExec(): void {
        try {
            for(let i in this.ranque) {

                this.calcularEspaco();

                // Espaço já é suficiente
                if(this.espaco.livre >= this.config.espacoMinimo) {
                    this.log('Espaço já é suficiente. Fim')
                    return;
                }

                // Saindo caso a importância seja acima de 400 pois pode ser uma folha
                // em execução no momento (muito recente)
                if(this.ranque[i].importancia > 400) {
                    this.log('Importância > 400. Fim')
                    return;
                }

                // Remove a pasta de execução
                rimraf.sync(this.ranque[i].caminho);
                this.log(`${this.ranque[i].toString()} removido\n`);
            }
            this.log(`Todas as pastas de execução foram removidas. Fim\n`);
        }
        catch(e) {
            this.erro(3, e);
        }
    }

    private calcularEspaco(): void {
        try {
            let buffer: any = cp.execFileSync('drivespace.exe', ['drive-' + this.config.unidade]);

            if(buffer instanceof Buffer) {
                let info: string[] =  iconv.decode(buffer, 'utf8').trim().split(',');
                this.espaco = {
                    usado: (parseInt(info[0]) - parseInt(info[1])) / MonitorarDisco.GB,
                    livre: parseInt(info[1]) / MonitorarDisco.GB,
                    total: parseInt(info[0]) / MonitorarDisco.GB
                };

                if (info[2] === 'NOTFOUND') {
					throw new Error('Drive não encontrado');
				}

                this.log('Usado: ' + this.espaco.usado.toFixed(2) +
                    '; Livre: ' + this.espaco.livre.toFixed(2) +
                    '; Total: ' + this.espaco.total.toFixed(2));
            }
            else {
                this.erro(5, 'Não é uma instância de Buffer');
            }
        }
        catch(e) {
            this.erro(6, e);
        }
    }

    private log(msg?: any): void {
        console.log(msg);
        this.logStr = this.logStr.concat(msg, '\n');
    }

    private salvarLog() {
        try {
            fs.appendFileSync('log.txt', this.logStr + '\n\n\n\n');
        }
        catch(e) {
            console.log(`Erro 99: não foi possível gravar log |||| ${e}`);
            return process.exit(99);
        }
    }

    private erro(numero: number, e: any) {
        this.log(`Erro ${numero}: ${e}`);
        this.salvarLog();
        return process.exit(numero);
    }

    private teste(): void {

        let result1: RegExpExecArray | null = this.rgxNivel1.exec('Destino_delta_SRVFVJ');
        this.rgxNivel1.lastIndex = 0;
        console.log(result1.toString());

        let result2: RegExpExecArray | null = this.rgxNivel3.exec('F_201808034_E00003');
        this.rgxNivel3.lastIndex = 0;
        console.log(result2.toString());

        let result3: RegExpExecArray | null = this.rgxNivel4.exec('FD180834-2.DAT');
        this.rgxNivel4.lastIndex = 0;
        console.log(result3.toString());
    }
}

MonitorarDisco.main();