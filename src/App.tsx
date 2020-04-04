import React from 'react';
import './App.css';

class Point {
	x: number;
	y: number;

	static random(width: number, height: number) {
		const x = Math.round(Math.random() * width);
		const y = Math.round(Math.random() * height);
		return new Point(x, y);
	}

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

	distanceTo(point: Point) {
		const dx = this.x - point.x;
		const dy = this.y - point.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

}

interface IAppState {
	grid: string[][];
	head: Point;
	tail: Point[];
	direction: 'up' | 'down' | 'left' | 'right';
	food: (Point | null)[];
}

class App extends React.Component {

	readonly width = 30;
	readonly height = 30;

	state: IAppState = {
		grid: [],
		head: new Point(0, 0),
		tail: [],
		direction: 'right',
		food: [],
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
		];
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
		let head = this.state.head;
		let direction = this.state.direction;

		const nearestFood = this.nearestFood();
		if (nearestFood) {
			if (nearestFood.x !== head.x) {
				direction = nearestFood.x - head.x < 0 ? 'left' : 'right';
			} else if (nearestFood.y !== head.y) {
				direction = nearestFood.y - head.y < 0 ? 'up' : 'down';
			}
		}

		// move in a circle
		const moveTry = head[direction]();
		if (this.canMoveHere(moveTry)) {
			head = moveTry;
		} else if (this.canMoveUp()) {
			head = head.up();
			direction = 'up';
		} else if (this.canMoveLeft()) {
			head = head.left();
			direction = 'left';
		} else if (this.canMoveDown()) {
			head = head.down();
			direction = 'down';
		} else if (this.canMoveRight()) {
			head = head.right();
			direction = 'right';
		} else {
			this.stop();
			console.log('Game Over');
		}

		const tail = this.dragTail();

		const food = this.state.food;
		if (food.length === 0) {
			food.push(Point.random(this.width, this.height));
		}

		this.setState({
			head, tail, direction, food,
		}, this.eatFood.bind(this));
	}

	eatFood() {
		if (!this.foodIncludes(this.state.head)) {
			return;
		}
		const foodIndex = this.state.food.findIndex((food: Point | null, index: number) => food && food.equals(this.state.head));
		console.log(foodIndex);
		if (foodIndex >= 0) {
			// delete this.state.food[foodIndex];
			// this.state.food[foodIndex] = null;
			let food = this.state.food;
			food.splice(foodIndex, 1);
			const tail = this.state.tail;
			tail.push(this.state.head);
			this.setState({
				food,
				tail,
			});
		}
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

	foodIncludes(point: Point) {
		for (const food of this.state.food) {
			if (food && food.equals(point)) {
				return true;
			}
		}
		return false;
	}

	nearestFood() {
		type IndexDistance = { index: number, distance: number };
		const foodDistance: IndexDistance[] = [];
		for (const index in this.state.food) {
			let foodElement = this.state.food[index];
			if (foodElement) {
				const distance = this.distanceTo(foodElement);
				foodDistance.push({index: parseInt(index), distance});
			}
		}
		foodDistance.sort((id1, id2) => id1.distance - id2.distance);
		if (foodDistance.length) {
			return this.state.food[foodDistance[0].index];
		}
		return null;
	}

	distanceTo(point: Point) {
		return this.state.head.distanceTo(point);
	}

	render() {
		return (
			<div className="App">
				{this.renderGrid()}
				<div className="debug">
					{this.state.food.map(food => {
						if (food) {
							return <div>{food.x} x {food.y} = {this.distanceTo(food)}</div>
						}
					})}
				</div>
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
								if (this.foodIncludes(new Point(x, y))) {
									cellType = 'food';
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
