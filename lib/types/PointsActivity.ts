interface PointsActivityRawData {
    description: string;
    date: Date;
    points: number;
}

interface PointsActivityDisplayData {
    description: string;
    date: string;
    points: number;
}

interface PointsActivity {
    startingPoints: number;
    PointsActivity: PointsActivityRawData[];
}

interface PointsActivityDisplay {
    startingPoints: number;
    PointsActivity: PointsActivityDisplayData[];
}

export type { PointsActivity, PointsActivityDisplay, PointsActivityDisplayData, PointsActivityRawData };
