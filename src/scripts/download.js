import { NavBar } from './nav_bar';

// console.log(count);
class ViewController {
  // Initialize Application
  constructor() {
    this.initializeComponents();
  }

  initializeComponents() {
    // Initialize Nav Bar
    this.navComponent = new NavBar('nav-holder');
  }
}

window.ctrl = new ViewController();
