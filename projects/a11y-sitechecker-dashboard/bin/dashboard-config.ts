import { Config } from 'a11y-sitechecker/lib/models/config';

export interface DashboardConfig extends Config {
    db?: Database;
}
interface Database {
    type: string;
    url: string;
    user: string;
    password: string;
}
