import debounce from "./debounce-scroll.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide); // ul
    this.wrapper = document.querySelector(wrapper); // div envolvendo a ul
    // ↓ obj responsavel pela posição
    this.dist = {
      finalPosition: 0, // posição ao soltar o mouse
      startX: 0, // posição onde mousedown ocorre
      movement: 0, // startX - finalPosition
    };
    this.activeClass = "active";
    this.changeEvent = new Event("changeEvent");
  }

  // (3)(7) transição suave
  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  // (7) move 'slide'
  moveSlide(distX) {
    this.dist.movePosition = distX; // = finalPosition
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`; // move o slide no eixo X
  }
  // (7) config de velocidade e posição das imgs
  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6; // posição onde mousemove ocorre
    return this.dist.finalPosition - this.dist.movement; // posição de transição no eixo X
  }

  // (3) previne o padrão, determina o startX como event.clientX, e adiciona o evento de mousemove
  onStart(event) {
    let movetype;
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transition(false);
  }

  // (4) determina que finalPosition será igual ao this.updatePosition(event.clientX) e executa moveSlide(finalPosition)
  onMove(event) {
    const pointerPosition =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }
  // (7) encerra o evento de mousemove/touchmove e inicia transition como true
  onEnd(event) {
    const movetype = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(movetype, this.onMove); // remove o evento mousemove de wrapper

    this.dist.finalPosition = this.dist.movePosition; // determina que a posição final vai ser a do próximo inicio
    this.transition(true); // determina uma transição suave ao soltar o mouse.
    this.changeSlideOnEnd(); // executa changeSlideOnEnd() ao soltar o mouse.
  }

  // (6) muda para o index que for de acordo com a condição.
  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  // (4) cria os eventos de mousedown e mouseup (touchstart, touchend)
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // (5) Slides config para posicionamento adequado
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2; // tamanho do wrapper menos o tamanho do slide(argumento), = margin dividido em 2
    return -(slide.offsetLeft - margin); // posição lateral menos a margin, assim a posição sera centralizada(o valor precisa ser negativo)
  }

  // (5) Dita o posicionamento com as configurações
  slidesConfig() {
    // ↓ loop da array com position sendo constante de slidePosition(element) ← e element sendo o argumento passado
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return {
        position,
        element,
      };
    });
  }
  // (5) dados de prev, active, next e do tamanho da array
  slideIndexNav(index) {
    const last = this.slideArray.length - 1; // tamanho da array
    this.index = {
      prev: index ? index - 1 : undefined, // prev
      active: index, // active
      next: index === last ? undefined : index + 1, // next
    };
  }
  // (5) posição do index
  changeSlide(index) {
    // .position é um método de activeSlide que da a posição do mesmo em números.
    const activeSlide = this.slideArray[index]; // constante que determina a posição em relação ao index da array
    this.moveSlide(activeSlide.position); // executa moveSlide com a constante activeSlide.position como argumento
    this.slideIndexNav(index); // determina qual será o próximo o atual e o anterior com configurações especificas
    this.dist.finalPosition = activeSlide.position; // determina que a posição final seja igual a activeSlide.position
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }
  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  // (6) vai para img anterior
  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }
  // (6) vai para img proxima
  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }
  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }
  // (2) bind(this) para puxar o this da class
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    // this.changeSlide = this.changeSlide.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  // (1) inicia o bindEvents, transition(true), addSlideEvents, slidesConfig
  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

// ↓ Extends de Slide sendo exportado
export default class SlideNav extends Slide {
  constructor(slide, wrapper) {
    // para o constructor ser o mesmo do que foi extendido utilizamos o super
    super(slide, wrapper);
    // executa o bind ja no construtor
    this.bindControlEvents();
  }

  // seleciona os botões para prev e next e executa addEventArrow()
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addEventArrow();
  }

  // adiciona o evento de clique aos botões, executando activePrevSlide e activeNextSlide que são responsáveis por navegar de proximo para anterior
  addEventArrow() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  // crua uma ul com atributo data-control="slide"
  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    // ↓ faz o loop em slideArray adicionando ao control.innerHTML um a dentro de uma li, contendo href de #slide com index de cada item de slideArray
    this.slideArray.forEach((index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${
        index + 1
      }</a></li>`;
    });
    // ↓ insere a ul e seu conteudo dentro de wrapper
    this.wrapper.appendChild(control);
    // ↓ retorna a ul com seu conteudo
    return control;
  }

  // adiciona um evento de clique ao item, previne o padrão, e executa changeSlide com o index e activeControlItem
  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index); // changeSlide é responsável pela troca de imagens
      this.activeControlItem(); // responsável por adicionar a classe que será estilizada
    });
    // determina que quando ocorrer o changeEvent executara o activeControlItem, para quando ocorrer as mudanças no slide a navegação acompanhar
    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  // remove a classe de todos os itens através do forEach e adiciona a classe ao item que será estilizado
  activeControlItem() {
    this.controlArray.forEach((item) =>
      item.classList.remove(this.activeClass)
    );
    // [this.index.active] faz referência ao item que estiver selecionado
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  // executa createControl() ou o custom que for criado, desestrutura ele como array(controlArray), faz um loop em controlArray executando eventControl()
  addControl(customControl) {
    this.control =
      document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem(); // executa para adicionar e remover classes que serão estilizadas
    this.controlArray.forEach(this.eventControl);
  }

  // bind para this
  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
