/* A DOM component that displays text and allows the user to edit it, turning into an input. */
export default class EditableText {
    constructor(id) {
	this.id = id;
	this.value = "";
	//TODO: Add instance variables, bind event handlers, etc.
	this._displayMode = true;
	this._callbacks = {onChange: null, onEdit: null, onSet: null};

	this._onEdit = this._onEdit.bind(this);
	this._onSet = this._onSet.bind(this);
    }

    /* Add the component (in display state) to the DOM under parent. When the value changes, onChange
       is called with a reference to this object. */
    addToDOM(parent, onChange) {
	//TODO
	var container =  this._createDisplay()
	parent.append(container)

	this._callbacks.onChange = onChange;

    }

    /* Set the value of the component and switch to display state if necessary. Does not call onChange */
    setValue(value) {
	//TODO

	this.value = value;
	document.querySelector(`#${this.id}`).replaceWith(this._createDisplay());

    }

    _createDisplay() {
	let container = document.createElement("div");
	container.id = this.id;
	container.classList.add("editableText");

	let text = document.createElement("span");
	text.textContent = this.value;
	container.appendChild(text);

	let button = document.createElement("button");
	button.type = "button";
	button.textContent = "Edit";
	//TODO: Add event handler to edit button
	button.addEventListener("click", this._onEdit);
	
	container.appendChild(button);

	return container;
    }

    _createInput() {
	let input = document.createElement("input");
	input.classList.add("editableInput");
	input.type = "text";
	input.id = this.id;
	input.value = this.value;
	//TODO: Add event handler to input
	input.addEventListener("blur", this._onSet);
	

	return input;
    }

    _onEdit() {
	this.displayMode = false;
	let input = this._createInput();
	document.querySelector(`#${this.id}`).replaceWith(input);
	input.focus();
    }

    _onSet(){
	let input = document.querySelector(`#${this.id}`);
	this.value = input.value;
	let display = this._createDisplay();
	this._callbacks.onChange(this)
	input.replaceWith(display)
    }

    
}
