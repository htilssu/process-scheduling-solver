import {ganttChartInfoType} from './';

export const npp = (
    arrivalTime: number[],
    burstTime: number[],
    priorities: number[]
) => {
    const processesInfo = arrivalTime
        .map((item, index) => {
            return {
                job: "P" + (index + 1),
                at: item,
                bt: burstTime[index],
                priority: priorities[index],
            };
        })
        .sort((process1, process2) => {
            if (process1.at > process2.at) return 1;
            if (process1.at < process2.at) return -1;
            if (process1.priority > process2.priority) return 1;
            if (process1.priority < process2.priority) return -1;
            return 0;
        });

    let finishTime: number[] = [];
    let ganttChartInfo: ganttChartInfoType = [];

    const solvedProcessesInfo = [];
    const readyQueue = [];
    const finishedJobs = [];

    for (let i = 0; i < processesInfo.length; i++) {
        if (i === 0) {
            readyQueue.push(processesInfo[0]);
            finishTime.push(processesInfo[0].at + processesInfo[0].bt);
            solvedProcessesInfo.push({
                ...processesInfo[0],
                ft: finishTime[0],
                tat: finishTime[0] - processesInfo[0].at,
                wat: finishTime[0] - processesInfo[0].at - processesInfo[0].bt,
                rt: finishTime[0] - processesInfo[0].at - processesInfo[0].bt,
            });

            processesInfo.forEach((p) => {
                if (p.at <= finishTime[0] && !readyQueue.includes(p)) {
                    readyQueue.push(p);
                }
            });

            readyQueue.shift();
            finishedJobs.push(processesInfo[0]);

            ganttChartInfo.push({
                job: processesInfo[0].job,
                start: processesInfo[0].at,
                stop: finishTime[0],
            });
        } else {
            if (
                readyQueue.length === 0 &&
                finishedJobs.length !== processesInfo.length
            ) {
                const unfinishedJobs = processesInfo
                    .filter((p) => {
                        return !finishedJobs.includes(p);
                    })
                    .sort((a, b) => {
                        if (a.at > b.at) return 1;
                        if (a.at < b.at) return -1;
                        if (a.priority > b.priority) return 1;
                        if (a.priority < a.priority) return -1;
                        return 0;
                    });
                readyQueue.push(unfinishedJobs[0]);
            }

            // Equal-priority processes are scheduled in FCFS order.
            const rqSortedByPriority = [...readyQueue].sort((a, b) => {
                if (a.priority > b.priority) return 1;
                if (a.priority < b.priority) return -1;
                if (a.at > b.at) return 1;
                if (a.at < b.at) return -1;
                return 0;
            });

            const processToExecute = rqSortedByPriority[0];

            const previousFinishTime = finishTime[finishTime.length - 1];

            if (processToExecute.at > previousFinishTime) {
                finishTime.push(processToExecute.at + processToExecute.bt);
                const newestFinishTime = finishTime[finishTime.length - 1];
                ganttChartInfo.push({
                    job: processToExecute.job,
                    start: processToExecute.at,
                    stop: newestFinishTime,
                });
            } else {
                finishTime.push(previousFinishTime + processToExecute.bt);
                const newestFinishTime = finishTime[finishTime.length - 1];
                ganttChartInfo.push({
                    job: processToExecute.job,
                    start: previousFinishTime,
                    stop: newestFinishTime,
                });
            }

            const newestFinishTime = finishTime[finishTime.length - 1];

            solvedProcessesInfo.push({
                ...processToExecute,
                ft: newestFinishTime,
                tat: newestFinishTime - processToExecute.at,
                wat: newestFinishTime - processToExecute.at - processToExecute.bt,
                rt: newestFinishTime - processToExecute.at - processToExecute.bt,
            });

            processesInfo.forEach((p) => {
                if (
                    p.at <= newestFinishTime &&
                    !readyQueue.includes(p) &&
                    !finishedJobs.includes(p)
                ) {
                    readyQueue.push(p);
                }
            });

            const indexToRemove = readyQueue.indexOf(processToExecute);
            if (indexToRemove > -1) {
                readyQueue.splice(indexToRemove, 1);
            }

            finishedJobs.push(processToExecute);
        }
    }

    // Sort the processes by job name within arrival time
    solvedProcessesInfo.sort((obj1, obj2) => {
        if (obj1.at > obj2.at) return 1;
        if (obj1.at < obj2.at) return -1;
        if (obj1.job > obj2.job) return 1;
        if (obj1.job < obj2.job) return -1;
        return 0;
    });

    return {solvedProcessesInfo, ganttChartInfo};
};
