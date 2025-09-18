import { PointsActivityRawData } from "../types/PointsActivity";

const StartingPoints: number = 1300;

const PointsActivityData: PointsActivityRawData[] = [
    {
        description: "✈️ NYC-SFO",
        date: new Date('2024-10-26'),
        points: 500
    },
    {
        description: "✈️ MCI-NYC",
        date: new Date('2024-09-15'),
        points: 300
    },
    {
        description: "✈️ NYC-MCI",
        date: new Date('2024-09-11'),
        points: 300
    },
    {
        description: "🏨 Partner hotel",
        date: new Date('2024-06-20'),
        points: 300
    },
    {
        description: "🏆 Status upgrade",
        date: new Date('2024-06-20'),
        points: -500
    },
    {
        description: "✈️ MCI-ORD",
        date: new Date('2024-06-20'),
        points: 300
    },
    {
        description: "✈️ NYC-ORD",
        date: new Date('2024-06-13'),
        points: 300
    }
];

export { PointsActivityData, StartingPoints };