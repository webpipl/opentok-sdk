class Alpha {
  counter: number | null;
  constructor() {
    this.counter = null;
  }
  handleIncrement = () => {
    if (this.counter !== null) {
      this.counter += 1;
    } else {
      this.counter = 0;
    }
    console.log("count:", this.counter);
  };
  handlDecrement = () => {
    if (this.counter !== null) {
      this.counter -= 1;
    } else {
      this.counter = 0;
    }
  };
}
class SampleClass extends Alpha {
  constructor() {
    super();
  }
  increment = () => {
    this.handleIncrement();
    // console.log("count:", this.counter);
  };
  decrement = () => {
    this.handlDecrement();
    // console.log("count:", this.counter);
  };
}
export default SampleClass;
