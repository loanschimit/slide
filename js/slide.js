export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = {
      finalPosition: 0, // posição ao soltar o mouse
      startX: 0, // posição onde mousedown ocorre
      movement: 0, // startX - finalPosition
    };
  }

  // bind(this) para puxar o this da class
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  // previne o padrão, determina o startX como event.clientX, e adiciona o evento de mousemove
  onStart(event) {
    event.preventDefault();
    this.dist.startX = event.clientX;
    this.wrapper.addEventListener("mousemove", this.onMove);
  }

  // move 'slide'
  moveSlide(distX) {
    this.dist.movePosition = distX; // = finalPosition
    this.slide.style.transform = `translate3d(${distX}px, 0px, 0px)`; // move o slide no eixo X
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6; // posição onde mousemove ocorre
    return this.dist.finalPosition - this.dist.movement; // posição de transição no eixo X
  }

  // determina que finalPosition será igual ao this.updatePosition(event.clientX) e executa moveSlide(finalPosition)
  onMove(event) {
    const finalPosition = this.updatePosition(event.clientX);
    this.moveSlide(finalPosition);
  }
  
  onEnd(event) {
    this.wrapper.removeEventListener("mousemove", this.onMove); // remove o evento mousemove de wrapper
    this.dist.finalPosition = this.dist.movePosition; // determina que a posição final vai ser a do próximo inicio
  }

  // cria os eventos de mousedown e mouseup
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}