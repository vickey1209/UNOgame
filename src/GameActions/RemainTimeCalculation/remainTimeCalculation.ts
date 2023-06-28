import { Logger } from "../../Logger/logger";

const RemainTimeCalculation = async (Job: any) => {

    try {

        Logger("RemainTimeCalculation", JSON.stringify(Job.data));

        if (!Job) { return 0; };

        const RemainingTime: number = (Date.now() - Job.timestamp) / 1000;

        const FixedRemainingTime: number = Number(RemainingTime.toFixed(2));

        const JobDelayTimer: number = Job?.opts?.delay ? Job.opts.delay : 1;

        const JobDelayTimerInSecond: number = JobDelayTimer / 1000;

        const FixedJobDelayTimer: number = Number(JobDelayTimerInSecond.toFixed(2));

        const FinalRemainingTime: number = FixedJobDelayTimer - (FixedRemainingTime * 1);

        const FixedFinalRemainingTime: number = Number(FinalRemainingTime.toFixed(2));

        if (FixedFinalRemainingTime < 0) { return 0; };

        return FixedFinalRemainingTime;

    } catch (error: any) {
        Logger('RemainTimeCalculation Error : ', error);
    };
};

export { RemainTimeCalculation };