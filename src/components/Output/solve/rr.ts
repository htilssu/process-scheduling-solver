import {ganttChartInfoType, getFirstTime} from './';

export const rr = (
  arrivalTime: number[],
  burstTime: number[],
  timeQuantum: number
) => {
  const processesInfo = arrivalTime
    .map((item, index) => {
      return {
        job: "P" + (index + 1),
        at: item,
        bt: burstTime[index],
      };
    })
    .sort((obj1, obj2) => {
      if (obj1.at > obj2.at) return 1;
      if (obj1.at < obj2.at) return -1;
      return 0;
    });

  let solvedProcessesInfo = [];
  const ganttChartInfo: ganttChartInfoType = [];

  const readyQueue: {
    job: string;
    at: number;
    bt: number;
  }[] = [];
  let currentTime = processesInfo[0].at;
  const unfinishedJobs = [...processesInfo];

  const remainingTime = processesInfo.reduce((acc, process) => {
    acc[process.job] = process.bt;
    return acc;
  }, {});

  readyQueue.push(unfinishedJobs[0]);
  while (
    Object.values(remainingTime).reduce((acc: number, cur: number) => {
      return acc + cur;
    }, 0) &&
    unfinishedJobs.length > 0
  ) {
    if (readyQueue.length === 0 && unfinishedJobs.length > 0) {
      // Previously idle
      readyQueue.push(unfinishedJobs[0]);
      currentTime = readyQueue[0].at;
    }

    const processToExecute = readyQueue[0];

    if (remainingTime[processToExecute.job] <= timeQuantum) {
      // Burst time less than or equal to time quantum, execute until finished
      const remainingT = remainingTime[processToExecute.job];
      remainingTime[processToExecute.job] -= remainingT;
      const prevCurrentTime = currentTime;
      currentTime += remainingT;
      
      ganttChartInfo.push({
        job: processToExecute.job,
        start: prevCurrentTime,
        stop: currentTime,
      });
    } else {
      remainingTime[processToExecute.job] -= timeQuantum;
      const prevCurrentTime = currentTime;
      currentTime += timeQuantum;

      ganttChartInfo.push({
        job: processToExecute.job,
        start: prevCurrentTime,
        stop: currentTime,
      });
    }
    const processToArriveInThisCycle = processesInfo.filter((p) => {
      return (
        p.at <= currentTime &&
        p !== processToExecute &&
        !readyQueue.includes(p) &&
        unfinishedJobs.includes(p)
      );
    });

    // Push new processes to readyQueue
    readyQueue.push(...processToArriveInThisCycle);

    // Requeueing (move head/first item to tail/last)
    readyQueue.push(readyQueue.shift());

    // When the process finished executing
    if (remainingTime[processToExecute.job] === 0) {
      const indexToRemoveUJ = unfinishedJobs.indexOf(processToExecute);
      if (indexToRemoveUJ > -1) {
        unfinishedJobs.splice(indexToRemoveUJ, 1);
      }
      const indexToRemoveRQ = readyQueue.indexOf(processToExecute);
      if (indexToRemoveRQ > -1) {
        readyQueue.splice(indexToRemoveRQ, 1);
      }

      solvedProcessesInfo.push({
        ...processToExecute,
        ft: currentTime,
        tat: currentTime - processToExecute.at,
        wat: currentTime - processToExecute.at - processToExecute.bt,
      });
    }
  }

  // Sort the processes arrival time and then by job name
  solvedProcessesInfo.sort((obj1, obj2) => {
    if (obj1.at > obj2.at) return 1;
    if (obj1.at < obj2.at) return -1;
    if (obj1.job > obj2.job) return 1;
    if (obj1.job < obj2.job) return -1;
    return 0;
  });

  const firstTime = getFirstTime(solvedProcessesInfo, ganttChartInfo);
  solvedProcessesInfo = solvedProcessesInfo.map((item, index) => ({
    ...item, rt: firstTime[index].rt - item.at,
  }))
  return { solvedProcessesInfo, ganttChartInfo };
};
