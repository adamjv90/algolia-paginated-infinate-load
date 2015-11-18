import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { fill, pluck, isNumber } from 'lodash';

function leaseIndexValue(array) {
  let lease = false;
  let indexOfLease;
  for (let i = 0; i < array.length; i++) {
    if (lease === false || array[i] < lease) {
      lease = array[i];
      indexOfLease = i;
    }
  }
  return indexOfLease;
}

// function greatestIndexValue(array) {
//   let greatest = false;
//   let indexOfGreatest;
//   for (let i = 0; i < array.length; i++) {
//     if (greatest === false || array[i] > greatest) {
//       greatest = array[i];
//       indexOfGreatest = i;
//     }
//   }
//   return indexOfGreatest;
// }

class EqualLengthColumns extends Component {
  static propTypes = {
    children: PropTypes.node,
    columns: PropTypes.number,
    margin: PropTypes.number
  }

  getColumns() {
    let columns = Immutable.fromJS(fill(Array(this.props.columns), {
      height: 0,
      rows: new Immutable.List([])
    }));

    for (let i = 0, len = this.props.children.length; i < len; i++) {
      const child = this.props.children[i];
      const columnIndex = leaseIndexValue(pluck(columns.toJS(), 'height'));
      const rowHeight = isNumber(child.props.height) ? child.props.height : parseInt(child.props.height, 1);
      let column = columns.get(columnIndex);

      column = column.set('height', column.get('height') + rowHeight + this.props.margin);
      column = column.set('rows', column.get('rows').push(child));

      columns = columns.set(columnIndex, column);
    }

    return columns.toJS();
  }

  render() {
    const columns = this.getColumns();

    return (
      <div style={ { width: '100%', height: '100%', display: 'flex', flexDirection: 'row' } }>
        { columns.map((column, i) => {
          return (
            <div key={ i } style={ { flex: 1, marginLeft: i % this.props.columns === 0 ? 0 : this.props.margin } }>
              { column.rows.map((row, ii) => {
                return <div key={ ii } style={ { marginBottom: this.props.margin } }>{ row }</div>;
              }) }
            </div>
          );
        }) }
      </div>
    );
  }

}

export default EqualLengthColumns;
