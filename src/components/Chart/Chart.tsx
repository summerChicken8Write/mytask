import * as React from 'react'
import { connect } from 'react-redux'

import './Chart.less'

interface IProps {
    state: {
        type: string,
        min_index: number,
        max_index: number,
        accident: object
    },
    current_index: number
}

interface Istate {
    height: number,
    yAxis: number[]
}

class Chart extends React.Component<IProps, Istate> {
    private canvas: React.RefObject<any>
    constructor(props: IProps) {
        super(props)
        this.canvas = React.createRef()
        this.state = {
            height: 0,
            yAxis: [80, 70, 60, 50, 40, 30, 20, 10]  //  Y轴坐标，可自行修改
        }
    }

    public componentDidMount() {
        this.setState({
            height: this.canvas.current.clientHeight
        })
        this.drawLine()
    }

    public componentDidUpdate() {
        this.drawLine()
    }

    public render() {
        const ChartTables = this.initTable('ChartTables')
        const TableNumber = this.initTable('TableNumber')
        const DataList = this.initDataList()

        return (
            <div className="Chart">
                <ul className="ChartTable">
                    {ChartTables}
                </ul>

                <ul className="TableNumbers">
                    {TableNumber}
                    <span className="zero">0</span>
                </ul>

                <canvas id="canvas" ref={this.canvas} />

                <ul className="DataList">{DataList}</ul>
            </div>
        )
    }

    private initTable(type: string) {
        const itemHeight = this.state.height / this.state.yAxis.length
        const table = this.state.yAxis.map((item, index) => {
            if(type === 'ChartTables') {
                return (
                    <li className="row" style={{top: index * itemHeight}} key={index} />
                )
            }
            else if(type === 'TableNumber') {
                return (
                    <li className="row" style={{top: index * itemHeight}} key={index}>
                        {this.state.yAxis[index]}
                    </li>
                )
            }
            return
        })
        return table
    }

    private drawLine() {
        const canvas = this.canvas.current
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        const context = canvas.getContext("2d")
        const obj = this.props.state
        const current_index = this.props.current_index

        //  这里找到current_index对应的data，并将每个部门数据中子项的长度保存在dataLen中
        Object.keys(obj).map((key) => {
            if((obj[key].type === 'line') && (obj[key].min_index <= current_index) && (current_index <= obj[key].max_index)) {
                const objChild = obj[key].accident
                Object.keys(objChild).map((childKey) => {
                    if(objChild[childKey].type_index === current_index) {
                        const data = objChild[childKey].data  //  current_index对应的事故数据
                        const dataLen: number[] = []  //  data中每个子项的长度值组成的数组
                        
                        Object.keys(data).map((dataKey) => {
                            dataLen.push(Object.keys(data[dataKey]).length)
                        })

                        Object.keys(data).map((dataKey, index) => {
                            const maxNum = Math.max(...this.state.yAxis)
                            const width = this.canvas.current.clientWidth / (Math.max(...dataLen))  //  横坐标系数
                            const height = this.canvas.current.clientHeight / maxNum  //  纵坐标系数，代表单位数据在屏幕所占高度
                            let color: string  //  线的颜色
                            const dataChild = data[dataKey]
                            const arr: number[] = []  //  将每个部门对应的数值放在这里，代表每月事故数量的纵坐标
                
                            //  根据部门的名称确定线的颜色，可自行修改每个部门的线条颜色
                            if(dataKey === 'ChengDu') {
                                color = 'rgb(255, 0, 0)'
                            }
                            else if(dataKey === 'GuiYang') {
                                color = 'rgb(255, 255, 0)'
                            }
                            else {
                                color = 'rgb(92, 138, 249)'
                            }
                            
                            Object.keys(dataChild).map((childItem) => {
                                arr.push(dataChild[childItem])
                            })
                
                            //  起点
                            context.moveTo(0, height * (maxNum - arr[0]))
                            
                            //  判断这组数据的子项长度是否一样，根据不同情况画出中间点和终点
                            if((Math.max(...dataLen) !== Math.min(...dataLen)) && (dataLen.indexOf(Math.max(...dataLen)) !== index)) {
                                for(let i = 1; i < (arr.length); i ++) {
                                    context.lineTo((width * i) + (width / 2), height * (maxNum - arr[i]))
                                }
                            }
                            else {
                                for(let k = 1; k < (arr.length - 1); k ++) {
                                    context.lineTo((width * k) + (width / 2), height * (maxNum - arr[k]))
                                }
                                context.lineTo(this.canvas.current.clientWidth, height * (maxNum - arr[arr.length - 1]))
                            }
                            
                            context.strokeStyle = color
                            context.stroke()
                        })
                    }
                })
            }
        })
    }

    private initDataList() {
        const obj = this.props.state
        const current_index = this.props.current_index
        let objChild: any
        let data: any  //  current_index对应的事故数据
        const dataLen: number[] = []  //  data中每个子项的长度值组成的数组，顺序与dataVal对应
        const dataVal: any = []  //  data中每个子项值组成的数组，顺序与dataLen对应

        Object.keys(obj).map((key) => {
            if((obj[key].type === 'line') && (obj[key].min_index <= current_index) && (current_index <= obj[key].max_index)) {
                objChild = obj[key].accident
                Object.keys(objChild).map((childKey) => {
                    if(objChild[childKey].type_index === current_index) {
                        //  根据current_index选出相对应的data
                        data = objChild[childKey].data
                        Object.keys(data).map((dataKey) => {
                            dataLen.push(Object.keys(data[dataKey]).length)
                            dataVal.push(Object.keys(data[dataKey]))
                        })
                    }
                })
            }
        })

        //  选出data中长度最长的一项用来渲染DataList
        const DataList = dataVal[dataLen.indexOf(Math.max(...dataLen))].map((key: string, index: number) => {
            return <li className="listItem" key={index}>{key}</li>
        })
        return DataList
    }    
}

function mapStateToProps(state: any) {
    return {
        state,
        current_index: state.config.current_index
    }
}

export default connect(mapStateToProps)(Chart);