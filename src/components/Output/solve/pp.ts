import {solvedProcessesInfoType, ganttChartInfoType, getFirstTime} from './';

export const pp = (
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

  let solvedProcessesInfo: solvedProcessesInfoType = [];
  const ganttChartInfo: ganttChartInfoType = [];

  const readyQueue: {
    job: string;
    at: number;
    bt: number;
    priority: number;
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
    let prevIdle = false;
    if (readyQueue.length === 0 && unfinishedJobs.length > 0) {
      prevIdle = true;
      readyQueue.push(unfinishedJobs[0]);
    }

    readyQueue.sort((a, b) => {
      // Equal-priority processes are scheduled in FCFS order.
      if (a.priority > b.priority) return 1;
      if (a.priority < b.priority) return -1;
      return 0;
    });

    const processToExecute = readyQueue[0];

    const processATLessThanBT = processesInfo.filter((p) => {
      let curr: number = currentTime;
      if (prevIdle) {
        curr = processToExecute.at;
      }

      return (
        p.at <= remainingTime[processToExecute.job] + curr &&
        p !== processToExecute &&
        !readyQueue.includes(p) &&
        unfinishedJobs.includes(p)
      );
    });
    let gotInterruption = false;
    processATLessThanBT.some((p) => {
      if (prevIdle) {
        currentTime = processToExecute.at;
      }

      const amount = p.at - currentTime;

      if (currentTime >= p.at) {
        readyQueue.push(p);
      }

      if (p.priority < processToExecute.priority) {
        remainingTime[processToExecute.job] -= amount;
        readyQueue.push(p);
        const prevCurrentTime = currentTime;
        currentTime += amount;
        ganttChartInfo.push({
          job: processToExecute.job,
          start: prevCurrentTime,
          stop: currentTime,
        });
        gotInterruption = true;
        return true;
      }
    });
    const processToArrive = processesInfo.filter((p) => {
      return (
        p.at <= currentTime &&
        p !== processToExecute &&
        !readyQueue.includes(p) &&
        unfinishedJobs.includes(p)
      );
    });

    // Push new processes to readyQueue
    readyQueue.push(...processToArrive);

    if (!gotInterruption) {
      if (prevIdle) {
        const remainingT = remainingTime[processToExecute.job];
        remainingTime[processToExecute.job] -= remainingT;
        currentTime = processToExecute.at + remainingT;

        processATLessThanBT.forEach((p) => {
          if (currentTime >= p.at) {
            readyQueue.push(p);
          }
        });

        ganttChartInfo.push({
          job: processToExecute.job,
          start: processToExecute.at,
          stop: currentTime,
        });
      } else {
        const remainingT = remainingTime[processToExecute.job];
        remainingTime[processToExecute.job] -= remainingT;
        const prevCurrentTime = currentTime;
        currentTime += remainingT;

        processATLessThanBT.forEach((p) => {
          if (currentTime >= p.at && !readyQueue.includes(p)) {
            readyQueue.push(p);
          }
        });
        ganttChartInfo.push({
          job: processToExecute.job,
          start: prevCurrentTime,
          stop: currentTime,
        });
      }
    }

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
        rt: currentTime - processToExecute.at - processToExecute.bt,
      });
    }
  }

  // Sort the processes by job name within arrival time
  solvedProcessesInfo.sort((process1, process2) => {
    if (process1.at > process2.at) return 1;
    if (process1.at < process2.at) return -1;
    if (process1.job > process2.job) return 1;
    if (process1.job < process2.job) return -1;
    return 0;
  });

  const firstTime = getFirstTime(solvedProcessesInfo, ganttChartInfo);
  solvedProcessesInfo = solvedProcessesInfo.map((item, index) => ({
    ...item, rt: firstTime[index].rt - item.at,
  }))

  return { solvedProcessesInfo, ganttChartInfo };
};
