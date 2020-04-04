import React from 'react';
import './App.css';

class Point {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	equals({x, y}: { x: number, y: number }) {
		return this.x === x && this.y === y;
	}

	up() {
		return new Point(this.x, this.y - 1);
	}

	down() {
		return new Point(this.x, this.y + 1);
	}

	left() {
		return new Point(this.x - 1, this.y);
	}

	right() {
		return new Point(this.x + 1, this.y);
	}

}

interface IAppState {
	grid: string[][];
	head: Point;
	tail: Point[];
	direction: 'up' | 'down' | 'left' | 'right';
}

class App extends React.Component {

	readonly width = 30;
	readonly height = 30;

	state: IAppState = {
		grid: [],
		head: new Point(0, 0),
		tail: [],
		direction: 'right',
	}

	timer: any;

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
		const left1 = this.state.head.left();
		const left2 = left1.left();
		this.state.tail = [
			left1, left2,
		]
	}

	componentDidMount(): void {
		this.timer = setInterval(this.logic.bind(this), 100);
	}

	componentWillUnmount(): void {
		this.stop();
	}

	stop() {
		clearInterval(this.timer);
	}

	logic() {
		let head;
		let direction = this.state.direction;
		const moveTry = this.state.head[this.state.direction]();
		if (this.canMoveHere(moveTry)) {
			head = moveTry;
		} else if (this.canMoveUp()) {
			head = this.state.head.up();
			direction = 'up';
		} else if (this.canMoveLeft()) {
			head = this.state.head.left();
			direction = 'left';
		} else if (this.canMoveDown()) {
			head = this.state.head.down();
			direction = 'down';
		} else if (this.canMoveRight()) {
			head = this.state.head.right();
			direction = 'right';
		} else {
			this.stop();
			console.log('Game Over');
		}

		const tail = this.dragTail();
		this.setState({
			head, tail, direction,
		});
	}

	dragTail() {
		this.state.tail.unshift(this.state.head);
		this.state.tail.pop();  // remove last tail
		return this.state.tail;
	}

	canMoveHere(point: Point) {
		if (point.x < 0 || point.x > this.width - 1) {
			return false;
		}
		if (point.y < 0 || point.y > this.height - 1) {
			return false;
		}
		if (this.tailIncludes(point)) {
			return false;
		}
		return true;
	}

	canMoveUp() {
		if (this.state.head.y <= 0) {
			return false;
		}
		if (this.tailIncludes(this.state.head.up())) {
			return false;
		}
		return true;
	}

	canMoveDown() {
		if (this.state.head.y >= this.height - 1) {
			return false;
		}
		if (this.tailIncludes(this.state.head.down())) {
			return false;
		}
		return true;
	}

	canMoveLeft() {
		if (this.state.head.x <= 0) {
			return false;
		}
		if (this.tailIncludes(this.state.head.left())) {
			return false;
		}
		return true;
	}

	canMoveRight() {
		if (this.state.head.x >= this.width - 1) {
			return false;
		}
		if (this.tailIncludes(this.state.head.right())) {
			return false;
		}
		return true;
	}

	tailIncludes(point: Point) {
		for (const block of this.state.tail) {
			if (block.equals(point)) {
				return true;
			}
		}
		return false;
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
								if (this.tailIncludes(new Point(x, y))) {
									cellType = 'tail';
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
