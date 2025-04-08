import { v4 as uuidv4 } from 'uuid';

class WorkerManager {
  private worker: Worker;
  private jobQueue: Map<string, (result: any) => void>;

  constructor() {
    this.worker = new Worker(new URL('./dataProcessor.ts', import.meta.url), {
      type: 'module',
    });
    this.jobQueue = new Map();

    this.worker.onmessage = (event) => {
      const { jobId, result } = event.data;
      const callback = this.jobQueue.get(jobId);
      if (callback) {
        callback(result);
        this.jobQueue.delete(jobId);
      }
    };
  }

  postJob(data: any, taskType: string): Promise<any> {
    return new Promise((resolve) => {
      const jobId = uuidv4();
      this.jobQueue.set(jobId, resolve);
      this.worker.postMessage({ jobId, taskType, ...data });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

const workerManager = new WorkerManager();
export default workerManager;
