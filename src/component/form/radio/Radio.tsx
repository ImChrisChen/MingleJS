/** * Created by WebStorm. * User: chrischen * Date: 2020/9/19 * Time: 3:16 上午 */import * as React from 'react'// import * as ReactDOM from 'react-dom'import { RadioGroup } from 'antd'export default class FormRadio extends React.Component<any, any> {    render() {        return <div>            <RadioGroup options={ [ '1', '2' ] }/>        </div>    }}