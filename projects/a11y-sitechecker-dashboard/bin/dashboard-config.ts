import { Config } from 'a11y-sitechecker/lib/models/config';

export interface DashboardConfig extends Config {
    db?: Database;
    idTags?: IdTag;
}
interface Database {
    type: string;
    url: string;
    user: string;
    password: string;
}
type IdTag = {
    [axeId: string]: string[];
};
