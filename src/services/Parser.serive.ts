/** * Created by WebStorm. * User: MacBook * Date: 2021/2/7 * Time: 3:49 下午 */import { Inject } from 'typescript-ioc';import { ParserTemplateService } from '@services/ParserTemplate.service';export class ParserSerive {    @Inject    private readonly parserTemplate: ParserTemplateService;    constructor() {    }}