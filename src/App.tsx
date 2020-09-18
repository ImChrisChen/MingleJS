import * as React from "react";import * as ReactDOM from "react-dom";import { getComponent } from "../utils/relationMap";function run() {    let elements = document.querySelectorAll(`[data-fn]`);    elements.forEach(async (element, index) => {        let container;        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {            container = document.createElement('div')            element.after(container);        } else {            container = element;        }        let id = `MingleModule-${ index }`;        element.setAttribute('id', id)        element.setAttribute('type', 'hidden');        container.setAttribute('data-for', id)        let moduleName = element.getAttribute('data-fn') ?? "";        let Component = await getComponent(moduleName);        ReactDOM.render(<Component el={ element }/>, container);    })}window.onload = function () {    run()}