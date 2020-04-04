import React from 'react';
import './App.css';

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals({x, y}: {x: number, y: number}) {
    return this.x === x && this.y === y;
  }

}

interface IAppState {
  grid: string[][];
  head: Point;
}

class App extends React.Component {

  readonly width = 30;
  readonly height = 30;

  state: IAppState = {
    grid: [],
    head: new Point(0, 0),
  }

  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state.grid = Array(this.height).fill(null).map(el => {
      return Array(this.width).fill(null);
    });
    // console.log(this.state.grid);
    // @ts-ignore
    window['app'] = this;
    this.state.head = new Point(Math.round(this.width / 2), this.height - 1);
  }

  render() {
    return (
      <div className="App">
        {this.renderGrid()}
      </div>
    );
  }

  renderGrid() {
    return (
      <table className="grid">
        <tbody>
        {this.state.grid.map((row, y) =>
          <tr key={y}>
            {row.map((cell, x) => {
                let cellType = this.state.grid[y][x];
                if (this.state.head.equals({x, y})) {
                  cellType = 'head';
                }
                return <td key={x} className={cellType}/>;
              }
            )}
          </tr>
        )}
        </tbody>
      </table>
    )
  }

}

export default App;
