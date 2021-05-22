/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/20
 * Time: 3:29 下午
 */
import { IComponentConfig } from '@src/config/interface';

interface IModuleConfig {
    [key: string]: IComponentConfig
}

export const moduleConfig: IModuleConfig = {
    app: {
        name: '应用模块',
    },
};

