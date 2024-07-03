import { DataSource } from 'typeorm';
import ormConfig from './config';

export default new DataSource(ormConfig.database);
