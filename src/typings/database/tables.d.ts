import { Knex } from 'knex';
import { Device } from './dto/Device.dto';

declare module 'knex/types/tables' {

    interface Tables {
        // TODO make sure the devices table is correctly set up
        devices: Knex.CompositeTableType<
        Device,
        Partial<Device>,
        Partial<Device> 
        >;
    }
}