var socket = require('./socket');

var whiteboardController = (function(){

	// whiteboard variables
	var $_whiteboard, $_whiteboardWidth, $_whiteboardHeight, $_whiteboardContext;

	// variables for painting
	var paint, color;

	// data for drawing
	var clickX, clickY, clickDrag, clickColor;

	/**
	 * Redraw the canvas
	 * 
	 */
	var redraw = function (){  

	  $_whiteboardContext.clearRect(0, 0, $_whiteboardWidth, $_whiteboardHeight); // Clears the canvas

	  $_whiteboardContext.lineJoin = "round";
	  $_whiteboardContext.lineWidth = 5;
				
	  for(var i=0; i < clickX.length; i++) {		
	    $_whiteboardContext.beginPath();
	    if(clickDrag[i] && i){
	      $_whiteboardContext.moveTo(clickX[i-1], clickY[i-1]);
	     }else{
	       $_whiteboardContext.moveTo(clickX[i]-1, clickY[i]);
	     }
	     $_whiteboardContext.lineTo(clickX[i], clickY[i]);
	     $_whiteboardContext.closePath();
	     $_whiteboardContext.strokeStyle = clickColor[i];
	     $_whiteboardContext.stroke();
	  }
	};

	var setEvents = function(){
		
		$_whiteboard.mousedown(function(e){
		  var mouseX = e.pageX - this.offsetLeft;
		  var mouseY = e.pageY - this.offsetTop;

		  paint = true;
		  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		  redraw();
		});

		$_whiteboard.mousemove(function(e){
			var mouseX = e.pageX - this.offsetLeft;
		  	var mouseY = e.pageY - this.offsetTop;

			if(paint){
				addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
		    	redraw();
			}
		});

		$_whiteboard.mouseup(function(e){
			paint = false;
		});

		$_whiteboard.mouseleave(function(e){
			paint = false;
		});

	}

	//Whiteboard Helper Methods
	
	var addClick = function (x, y, dragging){
		
		clickX.push(x);
		clickY.push(y);
		clickDrag.push(dragging);
		clickColor.push(color);

		socket.emit('sendCanvasData', clickX, clickY, clickDrag, clickColor);
	};

	var changeColor = function (_color){
		color = _color;
	};

	var emptyPoints = function () {
		clickX = new Array();
		clickY = new Array();
		clickDrag = new Array();
		clickColor = new Array();
	};

	var clearScreen = function () {
	  	$_whiteboardContext.clearRect(0, 0, $_whiteboardWidth, $_whiteboardHeight); // Clears the canvas
	  	emptyPoints();
		redraw();
		socket.emit('sendCanvasData', clickX, clickY, clickDrag, clickColor);
	}

	// public
	return{
		
		init: function(){
			$_whiteboard = $(".whiteboard");
			$_whiteboardWidth = $_whiteboard.width();
			$_whiteboardHeight = $_whiteboard.height();
			$_whiteboardElement = $_whiteboard.get(0);
			$_whiteboardContext = $_whiteboardElement.getContext("2d");

			paint = false;
			color = "black"; 

			clickX = new Array();
			clickY = new Array();
			clickDrag = new Array();
			clickColor = new Array();

			setEvents();
		},

		redrawCanvas: function(_clickX, _clickX, _clickDrag, _clickColor){
			clickX = _clickX;
			clickY = _clickX;
			clickDrag = _clickDrag;
			clickColor = _clickColor;

			redraw();
		}
		
	}

})();

module.exports = whiteboardController;
