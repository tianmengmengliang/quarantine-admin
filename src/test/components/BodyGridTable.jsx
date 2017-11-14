import React, { Component, PropTypes } from 'react';
import {BodyGridTable} from '../../components/'

class BodyGridTable2 extends Component{
    constructor(props) {
        super(props)
        this.state = {}
    }

    createRows = (rowCount, colCount)=>{
         let rows = [];
        for(let i =0; i<rowCount; i++){
            let row = [];
            for(let j=0; j<colCount; j++){
                row.push({
                    key: j,
                    span: 6,
                    title: `col${j}`
                })
            }
            rows.push(row)
        }
        return rows
    };

    render(){
        console.log("aa")
        const rows = this.createRows(10,4);
        return (
            <BodyGridTable rows={rows}/>
        )
    }
}

export default BodyGridTable2;