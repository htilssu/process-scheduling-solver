import {fcfs} from './fcfs';
import {sjf} from './sjf';
import {srtf} from './srtf';
import {rr} from './rr';
import {npp} from './npp';
import {pp} from './pp';
import {AlgoType} from '../../Input/AlgoSelect';

export type ganttChartInfoType = {
    job: string;
    start: number;
    stop: number;
}[];

export type firstCome = {
    job: string;
    rt: number;
}

export type solvedProcessesInfoType = {
    job: string;
    at: number;
    bt: number;
    ft: number;
    tat: number;
    wat: number;
    rt: number;
}[];

export const solve = (
    algo: AlgoType,
    arrivalTime: number[],
    burstTime: number[],
    timeQuantum: number,
    priorities: number[]
) => {
    switch (algo) {
        case 'FCFS':
            return fcfs(arrivalTime, burstTime);
        case 'SJF':
            return sjf(arrivalTime, burstTime);
        case 'SRTF':
            return srtf(arrivalTime, burstTime);
        case 'RR':
            return rr(arrivalTime, burstTime, timeQuantum);
        case 'NPP':
            return npp(arrivalTime, burstTime, priorities);
        case 'PP':
            return pp(arrivalTime, burstTime, priorities);
        default:
            break;
    }
};

export function getFirstTime(solvedProcessesInfo, ganttChartInfo) {
    const listFirstTime = [];
    for (const process of solvedProcessesInfo) {
        for (const gantt of ganttChartInfo) {
            if (process.job === gantt.job) {
                listFirstTime.push({rt: gantt.start})
                break;
            }
        }
    }
    return listFirstTime;
}
