/*
== malihu jquery thumbnail scroller plugin == 
Version: 2.0.3 
Plugin URI: http://manos.malihu.gr/jquery-thumbnail-scroller 
Author: malihu
Author URI: http://manos.malihu.gr
License: MIT License (MIT)
*/

/*
Copyright 2010 Manos Malihutsakis (email: manos@malihu.gr)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
The code below is fairly long, fully commented and should be normally used in development. 
For production, use the minified jquery.mThumbnailScroller.min.js script. 
*/

;(function($,window,document){
	
	/* 
	----------------------------------------
	PLUGIN NAMESPACE, PREFIX, DEFAULT SELECTOR(S) 
	----------------------------------------
	*/
	
	var pluginNS="mThumbnailScroller",
		pluginPfx="mTS",
		defaultSelector=".mThumbnailScroller",
	
	
		
	
	
	/* 
	----------------------------------------
	DEFAULT OPTIONS 
	----------------------------------------
	*/
	
		defaults={
			/*
			set element/content width/height programmatically 
			values: boolean, pixels, percentage 
				option						default
				-------------------------------------
				setWidth					false
				setHeight					false
			*/
			/*
			set the initial css top property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
			setTop:0,
			/*
			set the initial css left property of content  
			values: string (e.g. "-100px", "10%" etc.)
			*/
			setLeft:0,
			/* 
			set the scrolling type 
			values (string): "hover-0"/"hover-100" (number indicating percentage), "hover-precise", "click-0"/"click-100" (number indicating percentage), "click-thumb"
			*/
			type:"hover-50",
			/* 
			scroller axis (vertical and/or horizontal) 
			values (string): "y", "x", "yx"
			*/
			axis:"x",
			/*
			scrolling speed
			values: integer (higher=faster)
			*/
			speed:15,
			/*
			enable content touch-swipe scrolling 
			values: boolean, integer, string (number)
			integer values define the axis-specific minimum amount required for scrolling momentum
			*/
			contentTouchScroll:25,
			/*
			markup option parameters
			*/
			markup:{
				/*
				thumbnailsContainer sets the element containing your thumbnails. By default this is an unordered list ("ul") 
				thumbnailContainer sets the element containing each thumbnail. By default this is a list-item ("li") 
				thumbnailElement sets the actual thumbnail element. By default this is an image tag ("img") 
				values: boolean, string
					option						default
					-------------------------------------
					thumbnailsContainer			null
					thumbnailContainer			null
					thumbnailElement			null
					
				*/
				/*
				set the placeholder element of the buttons 
				values: boolean, string
				*/
				buttonsPlaceholder:false,
				/*
				set buttons HTML
				*/
				buttonsHTML:{
					up:"SVG set 1",
					down:"SVG set 1",
					left:"SVG set 1",
					right:"SVG set 1"
				}
			},
			/*
			advanced option parameters
			*/
			advanced:{
				/*
				auto-expand content horizontally (for "x" or "yx" axis) 
				values: boolean
				*/
				autoExpandHorizontalScroll:true,
				/*
				auto-update scrollers on content, element or viewport resize 
				should be true for fluid layouts/elements, adding/removing content dynamically, hiding/showing elements, content with images etc. 
				values: boolean
				*/
				updateOnContentResize:true,
				/*
				auto-update scrollers each time each image inside the element is fully loaded 
				values: boolean
				*/
				updateOnImageLoad:true
				/*
				auto-update scrollers based on the amount and size changes of specific selectors 
				useful when you need to update the scroller(s) automatically, each time a type of element is added, removed or changes its size 
				values: boolean, string (e.g. "ul li" will auto-update the scroller each time list-items inside the element are changed) 
				a value of true (boolean) will auto-update the scroller each time any element is changed
					option						default
					-------------------------------------
					updateOnSelectorChange		null
				*/
			},
			/* 
			scroller theme 
			values: string 
			*/
			theme:"none",
			/*
			user defined callback functions
			*/
			callbacks:{
				/*
				Available callbacks: 
					callback					default
					-------------------------------------
					onInit						null
					onScrollStart				null
					onScroll					null
					onTotalScroll				null
					onTotalScrollBack			null
					whileScrolling				null
				*/
				onTotalScrollOffset:0,
				onTotalScrollBackOffset:0,
				alwaysTriggerOffsets:true
			}
			/*
			add scroller(s) on all elements matching the current selector, now and in the future 
			values: boolean, string 
			string values: "on" (enable), "once" (disable after first invocation), "off" (disable)
			liveSelector values: string (selector)
				option						default
				-------------------------------------
				live						false
				liveSelector				null
			*/
		},
	
	
	
	
	
	/* 
	----------------------------------------
	VARS, CONSTANTS 
	----------------------------------------
	*/
	
		totalInstances=0, /* plugin instances amount */
		liveTimers={}, /* live option timers */
		oldIE=(window.attachEvent && !window.addEventListener) ? 1 : 0, /* detect IE < 9 */
		touchActive=false, /* global touch state (for touch and pointer events) */
		touchi, /* touch interface */
		/* general plugin classes */
		classes=["mTS_disabled","mTS_destroyed","mTS_no_scroll"],
		
	
	
	
	
	/* 
	----------------------------------------
	METHODS 
	----------------------------------------
	*/
	
		methods={
			
			/* 
			plugin initialization method 
			creates the scroller(s), plugin data object and options
			----------------------------------------
			*/
			
			init:function(options){
				
				var options=$.extend(true,{},defaults,options),
					selector=_selector.call(this); /* validate selector */
				
				/* 
				if live option is enabled, monitor for elements matching the current selector and 
				apply scroller(s) when found (now and in the future) 
				*/
				if(options.live){
					var liveSelector=options.liveSelector || this.selector || defaultSelector, /* live selector(s) */
						$liveSelector=$(liveSelector); /* live selector(s) as jquery object */
					if(options.live==="off"){
						/* 
						disable live if requested 
						usage: $(selector).mThumbnailScroller({live:"off"}); 
						*/
						removeLiveTimers(liveSelector);
						return;
					}
					liveTimers[liveSelector]=setTimeout(function(){
						/* call mThumbnailScroller fn on live selector(s) every half-second */
						$liveSelector.mThumbnailScroller(options);
						if(options.live==="once" && $liveSelector.length){
							/* disable live after first invocation */
							removeLiveTimers(liveSelector);
						}
					},500);
				}else{
					removeLiveTimers(liveSelector);
				}
				
				/* options  normalization */
				options.speed=options.speed===0 ? 100 : options.speed;
				
				_theme(options); /* theme-specific options */
				
				/* plugin constructor */
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if(!$this.data(pluginPfx)){ /* prevent multiple instantiations */
					
						/* store options and create objects in jquery data */
						$this.data(pluginPfx,{
							idx:++totalInstances, /* instance index */
							opt:options, /* options */
							html:null, /* element original html */
							overflowed:null, /* overflowed axis */
							bindEvents:false, /* object to check if events are bound */
							tweenRunning:false, /* object to check if tween is running */
							langDir:$this.css("direction"), /* detect/store direction (ltr or rtl) */
							cbOffsets:null, /* object to check whether callback offsets always trigger */
							/* 
							object to check how scrolling events where last triggered 
							"internal" (default - triggered by this script), "external" (triggered by other scripts, e.g. via scrollTo method) 
							usage: object.data("mTS").trigger
							*/
							trigger:null
						});
						
						/* HTML data attributes */
						var o=$this.data(pluginPfx).opt,
							htmlDataAxis=$this.data("mts-axis"),htmlDataType=$this.data("mts-type"),htmlDataTheme=$this.data("mts-theme");
						if(htmlDataAxis){o.axis=htmlDataAxis;} /* usage example: data-mts-axis="y" */
						if(htmlDataType){o.type=htmlDataType;} /* usage example: data-mts-type="hover-50" */
						if(htmlDataTheme){ /* usage example: data-mts-theme="theme-name" */
							o.theme=htmlDataTheme;
							_theme(o); /* theme-specific options */
						}
						
						_pluginMarkup.call(this); /* add plugin markup */
						
						methods.update.call(null,$this); /* call the update method */
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/* 
			plugin update method 
			updates content and scroller values, events and status 
			----------------------------------------
			usage: $(selector).mThumbnailScroller("update");
			*/
			
			update:function(el){
				
				var selector=el || _selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
						
						var d=$this.data(pluginPfx),o=d.opt,
							mTS_container=$("#mTS_"+d.idx+"_container");
						
						if(!mTS_container.length){return;}
						
						if(d.tweenRunning){_stop($this);} /* stop any running tweens while updating */
						
						/* if element was disabled or destroyed, remove class(es) */
						if($this.hasClass(classes[0])){$this.removeClass(classes[0]);}
						if($this.hasClass(classes[1])){$this.removeClass(classes[1]);}
						
						_maxHeight.call(this); /* detect/set css max-height value */
						
						_expandContentHorizontally.call(this); /* expand content horizontally */
						
						d.overflowed=_overflowed.call(this); /* determine if scrolling is required */
						
						_buttonsVisibility.call(this); /* show/hide buttons */
						
						_bindEvents.call(this); /* bind scroller events */
						
						/* reset scrolling position and/or events */
						var to=[(mTS_container[0].offsetTop),(mTS_container[0].offsetLeft)];
						if(o.axis!=="x"){ /* y/yx axis */
							if(!d.overflowed[0]){ /* y scrolling is not required */
								_resetContentPosition.call(this); /* reset content position */
								if(o.axis==="y"){
									_scrollTo($this,"0",{dir:"y",dur:0,overwrite:"none"});
									_unbindEvents.call(this);
								}else if(o.axis==="yx" && d.overflowed[1]){
									_scrollTo($this,to[1].toString(),{dir:"x",dur:0,overwrite:"none"});
								}
							}else{ /* y scrolling is required */
								_scrollTo($this,to[0].toString(),{dir:"y",dur:0,overwrite:"none"});
							}
						}
						if(o.axis!=="y"){ /* x/yx axis */
							if(!d.overflowed[1]){ /* x scrolling is not required */
								_resetContentPosition.call(this); /* reset content position */
								if(o.axis==="x"){
									_scrollTo($this,"0",{dir:"x",dur:0,overwrite:"none"});
									_unbindEvents.call(this);
								}else if(o.axis==="yx" && d.overflowed[0]){
									_scrollTo($this,to[0].toString(),{dir:"y",dur:0,overwrite:"none"});
								}
							}else{ /* x scrolling is required */
								_scrollTo($this,to[1].toString(),{dir:"x",dur:0,overwrite:"none"});
							}
						}
						
						/* no scroll class */
						if(!d.overflowed[0] && !d.overflowed[1]){
							$this.addClass(classes[2]);
						}else{
							$this.removeClass(classes[2]);
						}
						
						_autoUpdate.call(this); /* initialize automatic updating (for dynamic content, fluid layouts etc.) */
						
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/* 
			plugin scrollTo method 
			triggers a scrolling event to a specific value
			----------------------------------------
			usage: $(selector).mThumbnailScroller("scrollTo",value,options);
			*/
		
			scrollTo:function(val,options){
				
				/* prevent silly things like $(selector).mThumbnailScroller("scrollTo",undefined); */
				if(typeof val=="undefined" || val==null){return;}
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
					
						var d=$this.data(pluginPfx),o=d.opt,
							/* method default options */
							methodDefaults={
								trigger:"external", /* method is by default triggered externally (e.g. from other scripts) */
								speed:o.speed, /* scrolling speed */
								duration:1000, /* animation duration */
								easing:"easeInOut", /* animation easing */
								timeout:60, /* scroll-to delay */
								callbacks:true, /* enable/disable callbacks */
								onStart:true,
								onUpdate:true,
								onComplete:true
							},
							methodOptions=$.extend(true,{},methodDefaults,options),
							to=_arr.call(this,val),dur=methodOptions.duration ? methodOptions.duration : 7000/(methodOptions.speed || 1);
						
						/* translate yx values to actual scroll-to positions */
						to[0]=_to.call(this,to[0],"y");
						to[1]=_to.call(this,to[1],"x");
						
						methodOptions.dur=dur>0 && dur<17 ? 17 : dur;
						
						setTimeout(function(){ 
							/* do the scrolling */
							if(to[0]!==null && typeof to[0]!=="undefined" && o.axis!=="x" && d.overflowed[0]){ /* scroll y */
								methodOptions.dir="y";
								methodOptions.overwrite="all";
								_scrollTo($this,-to[0].toString(),methodOptions);
							}
							if(to[1]!==null && typeof to[1]!=="undefined" && o.axis!=="y" && d.overflowed[1]){ /* scroll x */
								methodOptions.dir="x";
								methodOptions.overwrite="none";
								_scrollTo($this,-to[1].toString(),methodOptions);
							}
						},methodOptions.timeout);
						
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin stop method 
			stops scrolling animation
			----------------------------------------
			usage: $(selector).mThumbnailScroller("stop");
			*/
			stop:function(){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
										
						_stop($this);
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin disable method 
			temporarily disables the scroller 
			----------------------------------------
			usage: $(selector).mThumbnailScroller("disable",reset); 
			reset (boolean): resets content position to 0 
			*/
			disable:function(r){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
						
						var d=$this.data(pluginPfx),o=d.opt;
						
						_autoUpdate.call(this,"remove"); /* remove automatic updating */
						
						_unbindEvents.call(this); /* unbind events */
						
						if(r){_resetContentPosition.call(this);} /* reset content position */
						
						_buttonsVisibility.call(this,true); /* show/hide buttons */
						
						$this.addClass(classes[0]); /* add disable class */
					
					}
					
				});
				
			},
			/* ---------------------------------------- */
			
			
			
			/*
			plugin destroy method 
			completely removes the scrollber and returns the element to its original state
			----------------------------------------
			usage: $(selector).mThumbnailScroller("destroy"); 
			*/
			destroy:function(){
				
				var selector=_selector.call(this); /* validate selector */
				
				return $(selector).each(function(){
					
					var $this=$(this);
					
					if($this.data(pluginPfx)){ /* check if plugin has initialized */
					
						var d=$this.data(pluginPfx),o=d.opt,
							mTS_wrapper=$("#mTS_"+d.idx),
							mTS_container=$("#mTS_"+d.idx+"_container"),
							mTS_buttons=$("#mTS_"+d.idx+"_buttonUp,#mTS_"+d.idx+"_buttonDown,#mTS_"+d.idx+"_buttonLeft,#mTS_"+d.idx+"_buttonRight");
					
						if(o.live){removeLiveTimers(selector);} /* remove live timer */
						
						_autoUpdate.call(this,"remove"); /* remove automatic updating */
						
						_unbindEvents.call(this); /* unbind events */
						
						_resetContentPosition.call(this); /* reset content position */
						
						$this.removeData(pluginPfx); /* remove plugin data object */
						
						_delete(this,"mts"); /* delete callbacks object */
						
						/* remove plugin markup */
						mTS_buttons.remove(); /* remove buttons first (those can be either inside or outside plugin's inner wrapper) */
						mTS_wrapper.replaceWith(d.html); /* replace plugin's inner wrapper with the original content */
						/* remove plugin classes from the element and add destroy class */
						$this.removeClass(pluginNS+" _"+pluginPfx+"_"+d.idx+" "+pluginPfx+"-"+o.theme+" "+classes[2]+" "+classes[0]).addClass(classes[1]);
					
					}
					
				});
				
			}
			/* ---------------------------------------- */
			
		},
	
	
	
	
		
	/* 
	----------------------------------------
	FUNCTIONS
	----------------------------------------
	*/
	
		/* validates selector (if selector is invalid or undefined uses the default one) */
		_selector=function(){
			return (typeof $(this)!=="object" || $(this).length<1) ? defaultSelector : this;
		},
		/* -------------------- */
		
		/* changes options according to theme */
		_theme=function(obj){
			var buttonsPlaceholderOutside=["buttons-out"],
				buttonsHtmlSet2=["buttons-in"],
				buttonsHtmlSet3=["buttons-out"],
				typeHover85=["hover-classic"],
				typeHoverPrecise=["hover-full"];
			obj.markup.buttonsPlaceholder=$.inArray(obj.theme,buttonsPlaceholderOutside) > -1 ? "outside" : obj.markup.buttonsPlaceholder;
			obj.markup.buttonsHTML=$.inArray(obj.theme,buttonsHtmlSet2) > -1 ? {up:"SVG set 2",down:"SVG set 2",left:"SVG set 2",right:"SVG set 2"} : $.inArray(obj.theme,buttonsHtmlSet3) > -1 ? {up:"SVG set 3",down:"SVG set 3",left:"SVG set 3",right:"SVG set 3"} : obj.markup.buttonsHTML;
			obj.type=$.inArray(obj.theme,typeHover85) > -1 ? "hover-85" : $.inArray(obj.theme,typeHoverPrecise) > -1 ? "hover-precise" : obj.type;
			obj.speed=$.inArray(obj.theme,typeHover85) > -1 ? 60 : $.inArray(obj.theme,typeHoverPrecise) > -1 ? 10 : obj.speed;
		},
		/* -------------------- */
		
		
		/* live option timers removal */
		removeLiveTimers=function(selector){
			if(liveTimers[selector]){
				clearTimeout(liveTimers[selector]);
				_delete(liveTimers,selector);
			}
		},
		/* -------------------- */
		
		
		/* generates plugin markup */
		_pluginMarkup=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				wrapperClass=o.axis==="yx" ? "mTS_vertical_horizontal" : o.axis==="x" ? "mTS_horizontal" : "mTS_vertical",
				thumbsContainer=o.markup.thumbnailsContainer || "ul",
				thumbContainer=o.markup.thumbnailContainer || "li",
				thumbElement=o.markup.thumbnailElement || "img";
			d.html=$this.children().clone(true,true); /* store element original html to restore when destroy method is called */
			if(!$this.find(thumbsContainer).length){ /* create images container automatically if not present */
				var thumbsAutoContainer=$this.find("li").length ? "<ul class='"+pluginPfx+"AutoContainer' />" : "<div class='"+pluginPfx+"AutoContainer' />";
				$this.wrapInner(thumbsAutoContainer);
				thumbsContainer="."+pluginPfx+"AutoContainer";
			}
			if(o.setWidth){$this.css("width",o.setWidth);} /* set element width */
			if(o.setHeight){$this.css("height",o.setHeight);} /* set element height */
			o.setLeft=(o.axis!=="y" && d.langDir==="rtl") ? "-989999px" : o.setLeft; /* adjust left position for rtl direction */
			$this	.addClass(pluginNS+" _"+pluginPfx+"_"+d.idx+" "+pluginPfx+"-"+o.theme)
					.find(thumbsContainer).wrap("<div id='mTS_"+d.idx+"' class='mTSWrapper "+wrapperClass+"' />")
						.addClass(pluginPfx+"Container").attr("id","mTS_"+d.idx+"_container")
						.css({"position":"relative","top":o.setTop,"left":o.setLeft})
					.find(thumbContainer).addClass(pluginPfx+"ThumbContainer")
					.find(thumbElement).addClass(pluginPfx+"Thumb");
			_scrollButtons.call(this); /* add scroller buttons */
		},
		/* -------------------- */
		
		
		/* expands content horizontally */
		_expandContentHorizontally=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_container=$("#mTS_"+d.idx+"_container");
			if(o.advanced.autoExpandHorizontalScroll && o.axis!=="y"){
				/* 
				wrap content with an infinite width div and set its position to absolute and width to auto. 
				Setting width to auto before calculating the actual width is important! 
				We must let the browser set the width as browser zoom values are impossible to calculate.
				*/
				mTS_container.css({"position":"absolute","width":"auto"})
					.wrap("<div class='mTS_h_wrapper' style='position:relative; left:0; width:999999px;' />")
					.css({ /* set actual width, original position and un-wrap */
						/* 
						get the exact width (with decimals) and then round-up. 
						Using jquery outerWidth() will round the width value which will mess up with inner elements that have non-integer width
						*/
						"width":(Math.ceil(mTS_container[0].getBoundingClientRect().right)-Math.floor(mTS_container[0].getBoundingClientRect().left)),
						"position":"relative"
					}).unwrap();
			}
		},
		/* -------------------- */
		
		
		/* adds scroller buttons */
		_scrollButtons=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				placeholder=!o.markup.buttonsPlaceholder ? $("#mTS_"+d.idx) : o.markup.buttonsPlaceholder==="outside" ? $this : $(o.markup.buttonsPlaceholder),
				btnHTML=[
					"<a href='#' id='mTS_"+d.idx+"_buttonUp' class='mTSButton mTSButtonUp'><span class='mTSButtonIconContainer'>"+_scrollButtonsIcons.call(this,"up")+"</span></a>",
					"<a href='#' id='mTS_"+d.idx+"_buttonDown' class='mTSButton mTSButtonDown'><span class='mTSButtonIconContainer'>"+_scrollButtonsIcons.call(this,"down")+"</span></a>",
					"<a href='#' id='mTS_"+d.idx+"_buttonLeft' class='mTSButton mTSButtonLeft'><span class='mTSButtonIconContainer'>"+_scrollButtonsIcons.call(this,"left")+"</span></a>",
					"<a href='#' id='mTS_"+d.idx+"_buttonRight' class='mTSButton mTSButtonRight'><span class='mTSButtonIconContainer'>"+_scrollButtonsIcons.call(this,"right")+"</span></a>"
				],
				btn=[(o.axis==="x" ? btnHTML[2] : btnHTML[0]),(o.axis==="x" ? btnHTML[3] : btnHTML[1])];
			if(placeholder.hasClass(pluginNS) && placeholder.css("position")==="static"){ /* requires elements with non-static position */
				placeholder.css("position","relative");
			}
			if(o.type.indexOf("click")!==-1){
				if(o.axis!=="x"){
					placeholder.append(btnHTML[0]+btnHTML[1]);
				}
				if(o.axis!=="y"){
					placeholder.append(btnHTML[2]+btnHTML[3]);
				}
			}
		},
		/* -------------------- */
		
		
		/* sets scroller buttons icons */
		_scrollButtonsIcons=function(b){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				btn=o.markup.buttonsHTML,
				i=btn[b]==="SVG set 1" ? 0 : btn[b]==="SVG set 2" ? 1 : btn[b]==="SVG set 3" ? 2 : btn[b]==="SVG set 4" ? 3 : btn[b]==="SVG set 5" ? 4 : null;
			switch(b){
				case "up":
					return i===null ? btn[b] : oldIE ? "&uarr;" : _icons(btn[b])[i][0];
					break;
				case "down":
					return i===null ? btn[b] : oldIE ? "&darr;" : _icons(btn[b])[i][1];
					break;
				case "left":
					return i===null ? btn[b] : oldIE ? "&larr;" : _icons(btn[b])[i][2];
					break;
				case "right":
					return i===null ? btn[b] : oldIE ? "&rarr;" : _icons(btn[b])[i][3];
					break;
			}
		},
		/* -------------------- */
		
		
		/* icons */
		_icons=function(){
			/* SVG */
			var svgo="<svg version='1.1' viewBox='0 0 24 24' preserveAspectRatio='xMinYMin meet' class='mTSButtonIcon'><g><line stroke-width='1' x1='' y1='' x2='' y2='' stroke='#449FDB' opacity=''></line></g>",
				svgc="</svg>";
			return [
				/* set 1 */
				[svgo+"<path d='M20.561 9.439l-7.5-7.5c-0.586-0.586-1.535-0.586-2.121 0l-7.5 7.5c-0.586 0.586-0.586 1.536 0 2.121s1.536 0.586 2.121 0l4.939-4.939v14.379c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5v-14.379l4.939 4.939c0.293 0.293 0.677 0.439 1.061 0.439s0.768-0.146 1.061-0.439c0.586-0.586 0.586-1.535 0-2.121z'></path>"+svgc,svgo+"<path d='M3.439 14.561l7.5 7.5c0.586 0.586 1.536 0.586 2.121 0l7.5-7.5c0.586-0.586 0.586-1.536 0-2.121s-1.536-0.586-2.121 0l-4.939 4.939v-14.379c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v14.379l-4.939-4.939c-0.293-0.293-0.677-0.439-1.061-0.439s-0.768 0.146-1.061 0.439c-0.586 0.586-0.586 1.536 0 2.121z'></path>"+svgc,svgo+"<path d='M9.439 3.439l-7.5 7.5c-0.586 0.586-0.586 1.536 0 2.121l7.5 7.5c0.586 0.586 1.536 0.586 2.121 0s0.586-1.536 0-2.121l-4.939-4.939h14.379c0.828 0 1.5-0.672 1.5-1.5s-0.672-1.5-1.5-1.5h-14.379l4.939-4.939c0.293-0.293 0.439-0.677 0.439-1.061s-0.146-0.768-0.439-1.061c-0.586-0.586-1.536-0.586-2.121 0z'></path>"+svgc,svgo+"<path d='M14.561 20.561l7.5-7.5c0.586-0.586 0.586-1.536 0-2.121l-7.5-7.5c-0.586-0.586-1.536-0.586-2.121 0s-0.586 1.536 0 2.121l4.939 4.939h-14.379c-0.828 0-1.5 0.672-1.5 1.5s0.672 1.5 1.5 1.5h14.379l-4.939 4.939c-0.293 0.293-0.439 0.677-0.439 1.061s0.146 0.768 0.439 1.061c0.586 0.586 1.536 0.586 2.121 0z'></path>"+svgc],
				/* set 2 */
				[svgo+"<path d='M18.58 13.724c-0.488-0.502-5.634-5.402-5.634-5.402-0.262-0.268-0.604-0.402-0.946-0.402-0.343 0-0.685 0.134-0.946 0.402 0 0-5.146 4.901-5.635 5.402-0.488 0.502-0.522 1.404 0 1.939 0.523 0.534 1.252 0.577 1.891 0l4.69-4.496 4.688 4.496c0.641 0.577 1.37 0.534 1.891 0 0.523-0.536 0.491-1.439 0-1.939z'</path>"+svgc,svgo+"<path d='M18.58 10.276c-0.488 0.502-5.634 5.404-5.634 5.404-0.262 0.268-0.604 0.401-0.946 0.401-0.343 0-0.685-0.133-0.946-0.401 0 0-5.146-4.902-5.635-5.404-0.488-0.502-0.522-1.403 0-1.939 0.523-0.535 1.252-0.577 1.891 0l4.69 4.498 4.688-4.496c0.641-0.577 1.37-0.535 1.891 0 0.523 0.535 0.491 1.438 0 1.938z'></path>"+svgc,svgo+"<path d='M13.724 5.419c-0.502 0.49-5.402 5.635-5.402 5.635-0.268 0.262-0.401 0.604-0.401 0.946s0.133 0.684 0.401 0.946c0 0 4.901 5.146 5.402 5.634 0.502 0.49 1.404 0.523 1.939 0 0.534-0.522 0.576-1.25-0.001-1.89l-4.496-4.69 4.496-4.69c0.577-0.641 0.535-1.369 0.001-1.891-0.536-0.522-1.439-0.49-1.939 0z'></path>"+svgc,svgo+"<path d='M10.276 5.419c0.502 0.49 5.402 5.635 5.402 5.635 0.269 0.262 0.402 0.604 0.402 0.946s-0.133 0.684-0.402 0.946c0 0-4.901 5.146-5.402 5.634-0.502 0.49-1.403 0.523-1.939 0-0.535-0.522-0.577-1.25 0-1.89l4.498-4.69-4.496-4.69c-0.577-0.641-0.535-1.369 0-1.891s1.438-0.49 1.938 0z'></path>"+svgc],
				/* set 3 */
				[svgo+"<path d='M20.902 17.279c0.325 0.322 0.851 0.322 1.175 0 0.325-0.322 0.325-0.841 0-1.163l-9.49-9.396c-0.324-0.322-0.85-0.322-1.174 0l-9.49 9.396c-0.324 0.322-0.325 0.841 0 1.163s0.85 0.322 1.175 0l8.902-8.569 8.902 8.569z'></path>"+svgc,svgo+"<path d='M3.098 6.721c-0.325-0.322-0.851-0.322-1.175 0-0.324 0.32-0.324 0.841 0 1.163l9.49 9.396c0.325 0.322 0.85 0.322 1.175 0l9.49-9.396c0.324-0.322 0.325-0.841 0-1.163s-0.852-0.322-1.175-0.001l-8.903 8.569-8.902-8.568z'></path>"+svgc,svgo+"<path d='M17.279 20.902c0.322 0.325 0.322 0.85 0 1.175s-0.841 0.325-1.163 0l-9.396-9.488c-0.322-0.325-0.322-0.851 0-1.175l9.396-9.49c0.322-0.325 0.841-0.325 1.163 0s0.322 0.85 0 1.175l-8.568 8.902 8.568 8.902z'</path>"+svgc,svgo+"<path d='M6.72 20.902c-0.322 0.325-0.322 0.85 0 1.175s0.841 0.325 1.163 0l9.396-9.488c0.322-0.325 0.322-0.851 0-1.175l-9.396-9.49c-0.322-0.325-0.841-0.325-1.163 0s-0.322 0.85 0 1.175l8.568 8.902-8.568 8.902z'</path>"+svgc],
				/* set 4 */
				[svgo+"<path d='M12 0l-12 12h7.5v12l9 0v-12h7.5z'></path>"+svgc,svgo+"<path d='M12 24l12-12h-7.5v-12l-9-0v12h-7.5z'></path>"+svgc,svgo+"<path d='M0 12l12 12v-7.5h12l0-9h-12v-7.5z'></path>"+svgc,svgo+"<path d='M24 12l-12-12v7.5h-12l-0 9h12v7.5z'></path>"+svgc],
				/* set 5 */
				[svgo+"<path d='M6.48 16.8h11.040l-5.521-9.6z'></path>"+svgc,svgo+"<path d='M17.52 7.201l-11.040-0.001 5.52 9.6z'></path>"+svgc,svgo+"<path d='M16.799 6.48l0.001 11.040-9.6-5.52z'></path>"+svgc,svgo+"<path d='M7.201 6.48l-0.001 11.040 9.6-5.52z'></path>"+svgc]
			];
		},
		/* -------------------- */
		
		
		/* detects/sets css max-height value */
		_maxHeight=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_wrapper=$("#mTS_"+d.idx),
				mh=$this.css("max-height"),pct=mh.indexOf("%")!==-1,
				bs=$this.css("box-sizing");
			if(mh!=="none"){
				var val=pct ? $this.parent().height()*parseInt(mh)/100 : parseInt(mh);
				/* if element's css box-sizing is "border-box", subtract any paddings and/or borders from max-height value */
				if(bs==="border-box"){val-=(($this.innerHeight()-$this.height())+($this.outerHeight()-$this.innerHeight()));}
				mTS_wrapper.css("max-height",Math.round(val));
			}
		},
		/* -------------------- */
		
		
		/* checks if content overflows its container to determine if scrolling is required */
		_overflowed=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container");
			return [mTS_container.height()>mTS_wrapper.height(),mTS_container.width()>mTS_wrapper.width()];
		},
		/* -------------------- */
		
		
		/* resets content position to 0 */
		_resetContentPosition=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container");
			_stop($this); /* stop any current scrolling before resetting */
			if((o.axis!=="x" && !d.overflowed[0]) || (o.axis==="y" && d.overflowed[0])){mTS_container.css("top",0);} /* reset y */
			if((o.axis!=="y" && !d.overflowed[1]) || (o.axis==="x" && d.overflowed[1])){ /* reset x */
				var rp=d.langDir==="rtl" ? mTS_wrapper.width()-mTS_container.width() : 0;
				mTS_container.css("left",rp);
			}
		},
		/* -------------------- */
		
		
		/* binds scroller events */
		_bindEvents=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt;
			if(!d.bindEvents){ /* check if events are already bound */
				if(o.contentTouchScroll){_contentDraggable.call(this);}
				if(o.type.indexOf("hover")!==-1){
					if(o.type==="hover-precise"){
						_hoverPrecise.call(this);
					}else{
						_hover.call(this);
					}
				}else if(o.type.indexOf("click")!==-1){
					_click.call(this);
				}
				d.bindEvents=true;
			}
		},
		/* -------------------- */
		
		
		/* unbinds scroller events */
		_unbindEvents=function(){
			var $this=$(this),d=$this.data(pluginPfx),
				namespace=pluginPfx+"_"+d.idx,
				sel=$("#mTS_"+d.idx+",#mTS_"+d.idx+"_container,#mTS_"+d.idx+"_buttonUp,#mTS_"+d.idx+"_buttonDown,#mTS_"+d.idx+"_buttonLeft,#mTS_"+d.idx+"_buttonRight"),
				mTS_container=$("#mTS_"+d.idx+"_container");
			if(d.bindEvents){ /* check if events are bound */
				/* unbind namespaced events from selectors */
				sel.each(function(){
					$(this).unbind("."+namespace);
				});
				/* clear and delete timeouts/objects */
				clearTimeout(mTS_container[0].onCompleteTimeout); _delete(mTS_container[0],"onCompleteTimeout");
				d.bindEvents=false;
			}
		},
		/* -------------------- */
		
		
		/* toggles scroller buttons visibility */
		_buttonsVisibility=function(disabled,hideBtn,dir){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt;
			if(o.type.indexOf("click")!==-1){
				if(!dir){dir=o.axis;}
				var	mTS_buttons=[$("#mTS_"+d.idx+"_buttonUp"),$("#mTS_"+d.idx+"_buttonDown"),$("#mTS_"+d.idx+"_buttonLeft"),$("#mTS_"+d.idx+"_buttonRight")],
					hideClass=pluginPfx+"-hidden";
				if(dir!=="x"){
					if(d.overflowed[0] && !disabled && !hideBtn){
						sel=[!d.overflowed[1] ? mTS_buttons[2].add(mTS_buttons[3]) : null,mTS_buttons[0].add(mTS_buttons[1])];
					}else{
						sel=hideBtn===1 ? [mTS_buttons[0],mTS_buttons[1]] : hideBtn===2 ? [mTS_buttons[1],mTS_buttons[0]] : [mTS_buttons[0].add(mTS_buttons[1]),null];
					}
				}
				if(dir!=="y"){
					if(d.overflowed[1] && !disabled && !hideBtn){
						sel=[!d.overflowed[0] ? mTS_buttons[0].add(mTS_buttons[1]) : null,mTS_buttons[2].add(mTS_buttons[3])];
					}else{
						sel=hideBtn===1 ? [mTS_buttons[2],mTS_buttons[3]] : hideBtn===2 ? [mTS_buttons[3],mTS_buttons[2]] : [mTS_buttons[2].add(mTS_buttons[3]),null];
					}
				}
				if(sel[0]){sel[0].addClass(hideClass);}
				if(sel[1]){sel[1].removeClass(hideClass);}
			}
		},
		/* -------------------- */
		
		
		/* returns input coordinates of pointer, touch and mouse events (relative to document) */
		_coordinates=function(e){
			var t=e.type;
			switch(t){
				case "pointerdown": case "MSPointerDown": case "pointermove": case "MSPointerMove": case "pointerup": case "MSPointerUp":
					return [e.originalEvent.pageY,e.originalEvent.pageX];
					break;
				case "touchstart": case "touchmove": case "touchend":
					var touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					return [touch.pageY,touch.pageX];
					break;
				default:
					return [e.pageY,e.pageX];
			}
		},
		/* -------------------- */
		
		/* returns input type */
		_inputType=function(e){
			return touchi || e.type.indexOf("touch")!==-1 || (typeof e.pointerType!=="undefined" && (e.pointerType===2 || e.pointerType==="touch")) ? "touch" : "mouse";
		},
		/* -------------------- */
		
		
		/* 
		TOUCH SWIPE EVENTS
		scrolls content via touch swipe 
		Emulates the native touch-swipe scrolling with momentum found in iOS, Android and WP devices 
		*/
		_contentDraggable=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				dragY,dragX,touchStartY,touchStartX,touchMoveY=[],touchMoveX=[],startTime,runningTime,endTime,distance,speed,amount,
				durA=0,durB,overwrite=o.axis==="yx" ? "none" : "all",touchIntent=[];
			mTS_container.bind("touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace,function(e){
				if(!_pointerTouch(e) || touchActive){return;}
				$this.removeClass("mTS_touch_action");
				var offset=mTS_container.offset();
				dragY=_coordinates(e)[0]-offset.top;
				dragX=_coordinates(e)[1]-offset.left;
				touchIntent=[_coordinates(e)[0],_coordinates(e)[1]];
			}).bind("touchmove."+namespace+" pointermove."+namespace+" MSPointerMove."+namespace,function(e){
				if(!_pointerTouch(e) || touchActive){return;}
				e.stopImmediatePropagation();
				runningTime=_getTime();
				var offset=mTS_wrapper.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left,
					easing="linearOut";
				touchMoveY.push(y);
				touchMoveX.push(x);
				touchIntent[2]=Math.abs(_coordinates(e)[0]-touchIntent[0]); touchIntent[3]=Math.abs(_coordinates(e)[1]-touchIntent[1]);
				if(d.overflowed[0]){
					var limit=mTS_wrapper.height()-mTS_container.height(),
						prevent=((dragY-y)>0 && (y-dragY)>limit && (touchIntent[3]*2<touchIntent[2]));
				}
				if(d.overflowed[1]){
					var limitX=mTS_wrapper.width()-mTS_container.width(),
						preventX=((dragX-x)>0 && (x-dragX)>limitX && (touchIntent[2]*2<touchIntent[3]));
				}
				if(prevent || preventX){e.preventDefault();}else{$this.addClass("mTS_touch_action");} /* prevent native document scrolling */
				amount=o.axis==="yx" ? [(dragY-y),(dragX-x)] : o.axis==="x" ? [null,(dragX-x)] : [(dragY-y),null];
				mTS_container[0].idleTimer=250;
				if(d.overflowed[0]){_drag(amount[0],durA,easing,"y","all");}
				if(d.overflowed[1]){_drag(amount[1],durA,easing,"x",overwrite);}
			});
			mTS_wrapper.bind("touchstart."+namespace+" pointerdown."+namespace+" MSPointerDown."+namespace,function(e){
				if(!_pointerTouch(e) || touchActive){return;}
				e.stopImmediatePropagation();
				touchi=true;
				_stop($this);
				startTime=_getTime();
				var offset=mTS_wrapper.offset();
				touchStartY=_coordinates(e)[0]-offset.top;
				touchStartX=_coordinates(e)[1]-offset.left;
				touchMoveY=[]; touchMoveX=[];
			}).bind("touchend."+namespace+" pointerup."+namespace+" MSPointerUp."+namespace,function(e){
				if(!_pointerTouch(e) || touchActive){return;}
				e.stopImmediatePropagation();
				endTime=_getTime();
				var offset=mTS_wrapper.offset(),y=_coordinates(e)[0]-offset.top,x=_coordinates(e)[1]-offset.left;
				if((endTime-runningTime)>30){return;}
				speed=1000/(endTime-startTime);
				var easing="easeOut",slow=speed<2.5,
					diff=slow ? [touchMoveY[touchMoveY.length-2],touchMoveX[touchMoveX.length-2]] : [0,0];
				distance=slow ? [(y-diff[0]),(x-diff[1])] : [y-touchStartY,x-touchStartX];
				var absDistance=[Math.abs(distance[0]),Math.abs(distance[1])];
				speed=slow ? [Math.abs(distance[0]/4),Math.abs(distance[1]/4)] : [speed,speed];
				var a=[
					Math.abs(mTS_container[0].offsetTop)-(distance[0]*_m((absDistance[0]/speed[0]),speed[0])),
					Math.abs(mTS_container[0].offsetLeft)-(distance[1]*_m((absDistance[1]/speed[1]),speed[1]))
				];
				amount=o.axis==="yx" ? [a[0],a[1]] : o.axis==="x" ? [null,a[1]] : [a[0],null];
				durB=[(absDistance[0]*4)+(o.speed*60),(absDistance[1]*4)+(o.speed*60)];
				var md=parseInt(o.contentTouchScroll) || 0; /* absolute minimum distance required */
				amount[0]=absDistance[0]>md ? amount[0] : 0;
				amount[1]=absDistance[1]>md ? amount[1] : 0;
				if(d.overflowed[0]){_drag(amount[0],durB[0],easing,"y",overwrite);}
				if(d.overflowed[1]){_drag(amount[1],durB[1],easing,"x",overwrite);}
			});
			function _m(ds,s){
				var r=[s*1.5,s*2,s/1.5,s/2];
				if(ds>90){
					return s>4 ? r[0] : r[3];
				}else if(ds>60){
					return s>3 ? r[3] : r[2];
				}else if(ds>30){
					return s>8 ? r[1] : s>6 ? r[0] : s>4 ? s : r[2];
				}else{
					return s>8 ? s : r[3];
				}
			}
			function _drag(amount,dur,easing,dir,overwrite){
				if(!amount){return;}
				_scrollTo($this,-amount.toString(),{dur:dur,easing:easing,dir:dir,overwrite:overwrite});
			}
		},
		/* -------------------- */
		
		
		/* 
		HOVER PRECISE EVENT
		scrolls content via cursor movement
		*/
		_hoverPrecise=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				evt=window.navigator.pointerEnabled ? "pointermove" : window.navigator.msPointerEnabled ? "MSPointerMove" : "mousemove",
				cursor,dest,to;
			mTS_wrapper.bind(evt+"."+namespace,function(e){
				if(_inputType(e.originalEvent || e)==="touch" || (!d.overflowed[0] && !d.overflowed[1])){return;}
				e.preventDefault();
				var wrapperHeight=mTS_wrapper.height(),containerHeight=mTS_container.height(),
					wrapperWidth=mTS_wrapper.width(),containerWidth=mTS_container.width(),
					speed=((containerWidth/wrapperWidth)*7000)/(o.speed || 1);
				cursor=[_coordinates(e)[0]-mTS_wrapper.offset().top,_coordinates(e)[1]-mTS_wrapper.offset().left];
				dest=[cursor[0]/mTS_wrapper.height(),cursor[1]/mTS_wrapper.width()];
				to=[Math.round(-((containerHeight-wrapperHeight)*(dest[0]))),Math.round(-((containerWidth-wrapperWidth)*(dest[1])))];
				if(o.axis!=="x" && d.overflowed[0]){
					_scrollTo($this,to[0].toString(),{dir:"y",dur:speed,easing:"easeOut"});
				}
				if(o.axis!=="y" && d.overflowed[1]){
					_scrollTo($this,to[1].toString(),{dir:"x",dur:speed,easing:"easeOut"});
				}
			});
		},
		/* -------------------- */
		
		
		/* 
		HOVER EVENT
		scrolls content via cursor movement
		*/
		_hover=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				evt=window.navigator.pointerEnabled ? ["pointerover","pointermove","pointerout"] : 
					window.navigator.msPointerEnabled ? ["MSPointerOver","MSPointerMove","MSPointerOut"] : 
					["mouseenter","mousemove","mouseleave"],
				rAF,cursor,dest,to,fps,delay=(!window.requestAnimationFrame) ? 17 : 0,
				speed=o.speed,pct=parseInt(o.type.split("hover-")[1]) || 1,idle=speed*pct/100,
				_pause=[0,0];
			mTS_wrapper.bind(evt[0]+"."+namespace,function(e){
				if(_inputType(e.originalEvent || e)==="touch" || (!d.overflowed[0] && !d.overflowed[1])){return;}
				_on();
			}).bind(evt[1]+"."+namespace,function(e){
				if(_inputType(e.originalEvent || e)==="touch" || (!d.overflowed[0] && !d.overflowed[1])){return;}
				cursor=[_coordinates(e)[0]-mTS_wrapper.offset().top,_coordinates(e)[1]-mTS_wrapper.offset().left];
				dest=[Math.round((Math.cos((cursor[0]/mTS_wrapper.height())*Math.PI))*speed),Math.round((Math.cos((cursor[1]/mTS_wrapper.width())*Math.PI))*speed)];
				dest[0]=dest[0]<=-idle ? dest[0]+=idle : dest[0]>=idle ? dest[0]-=idle : dest[0]=0;
				dest[1]=dest[1]<=-idle ? dest[1]+=idle : dest[1]>=idle ? dest[1]-=idle : dest[1]=0;
				_pause=[0,0];
			}).bind(evt[2]+"."+namespace,function(e){
				if(_inputType(e.originalEvent || e)==="touch" || (!d.overflowed[0] && !d.overflowed[1])){return;}
				_off();
			});
			function _on(){
				if(mTS_wrapper[0].rAF){return;}
				rAF=(!window.requestAnimationFrame) ? function(f){return setTimeout(f,17);} : window.requestAnimationFrame;
				mTS_wrapper[0].rAF=rAF(_anim);
			}
			function _off(){
				if(mTS_wrapper[0].rAF==null){return;}
				if(!window.requestAnimationFrame){
					clearTimeout(mTS_wrapper[0].rAF);
				}else{
					window.cancelAnimationFrame(mTS_wrapper[0].rAF);
				}
				clearTimeout(fps);
				mTS_wrapper[0].rAF=null;
			}
			function _anim(){
				if(touchi){return;} /* this is for android native browser (at least for version 4.1.2) */
				to=[dest[0]+mTS_container[0].offsetTop,dest[1]+mTS_container[0].offsetLeft];
				var limit=[mTS_wrapper.height()-mTS_container.height(),mTS_wrapper.width()-mTS_container.width()];
				if(o.axis!=="x" && d.overflowed[0]){
					to[0]=to[0]>0 ? 0 : to[0]<limit[0] ? limit[0] : to[0];
					if(dest[0] && !_pause[0]){
						_scrollTo($this,to[0],{dir:"y",dur:0,easing:"linear"});
					}
					if(to[0]>=0 || to[0]<=limit[0]){
						_pause[0]=1;
					}
				}
				if(o.axis!=="y" && d.overflowed[1]){
					to[1]=to[1]>0 ? 0 : to[1]<limit[1] ? limit[1] : to[1];
					if(dest[1] && !_pause[1]){
						_scrollTo($this,to[1],{dir:"x",dur:0,easing:"linear"});
					}
					if(to[1]>=0 || to[1]<=limit[1]){
						_pause[1]=1;
					}
				}
				fps=setTimeout(function(){mTS_wrapper[0].rAF=rAF(_anim);},delay);					
			}
		},
		/* -------------------- */
		
		
		/* 
		CLICK EVENT
		scrolls content via scrolling buttons
		*/
		_click=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				namespace=pluginPfx+"_"+d.idx,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				mTS_buttons=[$("#mTS_"+d.idx+"_buttonUp"),$("#mTS_"+d.idx+"_buttonDown"),$("#mTS_"+d.idx+"_buttonLeft"),$("#mTS_"+d.idx+"_buttonRight")],
				sel=mTS_buttons[0].add(mTS_buttons[1]).add(mTS_buttons[2]).add(mTS_buttons[3]);
			sel.bind("click."+namespace,function(e){
				if(!_mouseBtnLeft(e) || (!d.overflowed[0] && !d.overflowed[1])){return;}
				e.preventDefault();
				if(d.tweenRunning){return;}
				if(o.axis!=="x" && d.overflowed[0]){
					var h=mTS_wrapper.height(),dir=o.type==="click-thumb" ? 0 : $(this).hasClass("mTSButtonUp") ? "+=" : $(this).hasClass("mTSButtonDown") ? "-=" : 0;
					if(o.type!=="click-thumb"){
						var pct=parseInt(o.type.split("click-")[1]) || 1,amount=dir ? [dir+(h*pct/100),null] : 0;
					}else{
						var firstThumb=_firstLast.call($this[0])[0],lastThumb=_firstLast.call($this[0])[1];
						if($(this).hasClass("mTSButtonDown")){
							var	amount=lastThumb ? (lastThumb[0].offsetTop-parseInt(lastThumb.css("margin-bottom")))-h : 989999;
						}else if($(this).hasClass("mTSButtonUp")){
							var	amount=firstThumb ? firstThumb[0].offsetTop-parseInt(firstThumb.css("margin-top")) : 0;
							if(mTS_container[0].offsetTop===0){return;}
						}
					}
				}
				if(o.axis!=="y" && d.overflowed[1]){
					var w=mTS_wrapper.width(),dir=o.type==="click-thumb" ? 0 : $(this).hasClass("mTSButtonLeft") ? "+=" : $(this).hasClass("mTSButtonRight") ? "-=" : 0;
					if(o.type!=="click-thumb"){
						var pct=parseInt(o.type.split("click-")[1]) || 1,amount=dir ? [null,dir+(w*pct/100)] : amount;
					}else{
						var firstThumb=_firstLast.call($this[0])[2],lastThumb=_firstLast.call($this[0])[3];
						if($(this).hasClass("mTSButtonRight")){
							var	amount=lastThumb ? (lastThumb[0].offsetLeft-parseInt(lastThumb.css("margin-right")))-w : 989999;
						}else if($(this).hasClass("mTSButtonLeft")){
							var	amount=firstThumb ? firstThumb[0].offsetLeft-parseInt(firstThumb.css("margin-left")) : 0;
							if(mTS_container[0].offsetLeft===0){return;}
						}
					}
				}
				if(amount!==null){methods.scrollTo.call($this[0],amount,{duration:0});}
			});
		},
		/* -------------------- */
		
		
		/* returns the first and last items within the viewport */
		_firstLast=function(){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_container=$("#mTS_"+d.idx+"_container"),
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_item=mTS_container.find(".mTSThumbContainer"),
				f,l,fx,lx;
			mTS_item.each(function(){
				var el=$(this),
					pos=[
						Math.round((el.offset().top-mTS_container.offset().top)+mTS_container[0].offsetTop),
						Math.round((el.offset().left-mTS_container.offset().left)+mTS_container[0].offsetLeft)
					];
				if(pos[0]<=0-parseInt(el.css("margin-top"))){
					f=pos[0]===0 ? mTS_item.eq(el.index()-1) : mTS_item.eq(el.index());
				}else if(pos[0]<=mTS_wrapper.height()+parseInt(el.css("margin-bottom"))){
					var i=mTS_item.eq(el.index()+1);
					l=i.length ? i : null;
				}
				if(pos[1]<=0-parseInt(el.css("margin-left"))){
					fx=pos[1]===0 ? mTS_item.eq(el.index()-1) : mTS_item.eq(el.index());
				}else if(pos[1]<=mTS_wrapper.width()+parseInt(el.css("margin-right"))){
					var ix=mTS_item.eq(el.index()+1);
					lx=ix.length ? ix : null;
				}
			});
			return [f,l,fx,lx];
		},
		/* -------------------- */
		
		
		/* returns a yx array from value */
		_arr=function(val){
			var o=$(this).data(pluginPfx).opt,vals=[];
			if(typeof val==="function"){val=val();} /* check if the value is a single anonymous function */
			/* check if value is object or array, its length and create an array with yx values */
			if(!(val instanceof Array)){ /* object value (e.g. {y:"100",x:"100"}, 100 etc.) */
				vals[0]=val.y ? val.y : val.x || o.axis==="x" ? null : val;
				vals[1]=val.x ? val.x : val.y || o.axis==="y" ? null : val;
			}else{ /* array value (e.g. [100,100]) */
				vals=val.length>1 ? [val[0],val[1]] : o.axis==="x" ? [null,val[0]] : [val[0],null];
			}
			/* check if array values are anonymous functions */
			if(typeof vals[0]==="function"){vals[0]=vals[0]();}
			if(typeof vals[1]==="function"){vals[1]=vals[1]();}
			return vals;
		},
		/* -------------------- */
		
		
		/* translates values (e.g. "top", 100, "100px", "#id") to actual scroll-to positions */
		_to=function(val,dir){
			if(val==null || typeof val=="undefined"){return;}
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				t=typeof val;
			if(!dir){dir=o.axis==="x" ? "x" : "y";}
			var contentLength=dir==="x" ? mTS_container.width() : mTS_container.height(),
				contentOffset=dir==="x" ? mTS_container.offset().left : mTS_container.offset().top,
				contentPos=dir==="x" ? mTS_container[0].offsetLeft : mTS_container[0].offsetTop,
				cssProp=dir==="x" ? "left" : "top";
			switch(t){
				case "function": /* this currently is not used. Consider removing it */
					return val();
					break;
				case "object":
					if(val.nodeType){ /* DOM */
						var objOffset=dir==="x" ? $(val).offset().left : $(val).offset().top;
					}else if(val.jquery){ /* jquery object */
						if(!val.length){return;}
						var objOffset=dir==="x" ? val.offset().left : val.offset().top;
					}
					return objOffset-contentOffset;
					break;
				case "string": case "number":
					if(_isNumeric(val)){ /* numeric value */
						return Math.abs(val);
					}else if(val.indexOf("%")!==-1){ /* percentage value */
						return Math.abs(contentLength*parseInt(val)/100);
					}else if(val.indexOf("-=")!==-1){ /* decrease value */
						return Math.abs(contentPos-parseInt(val.split("-=")[1]));
					}else if(val.indexOf("+=")!==-1){ /* inrease value */
						var p=(contentPos+parseInt(val.split("+=")[1]));
						return p>=0 ? 0 : Math.abs(p);
					}else if(val.indexOf("px")!==-1 && _isNumeric(val.split("px")[0])){ /* pixels string value (e.g. "100px") */
						return Math.abs(val.split("px")[0]);
					}else{
						if(val==="top" || val==="left"){ /* special strings */
							return 0;
						}else if(val==="bottom"){
							return Math.abs(mTS_wrapper.height()-mTS_container.height());
						}else if(val==="right"){
							return Math.abs(mTS_wrapper.width()-mTS_container.width());
						}else if(val==="first" || val==="last"){
							var obj=mTS_container.find(":"+val),
								objOffset=dir==="x" ? $(obj).offset().left : $(obj).offset().top;
							return objOffset-contentOffset;
						}else{
							if($(val).length){ /* jquery selector */
								var objOffset=dir==="x" ? $(val).offset().left : $(val).offset().top;
								return objOffset-contentOffset;
							}else{ /* other values (e.g. "100em") */
								mTS_container.css(cssProp,val);
								methods.update.call(null,$this[0]);
								return;
							}
						}
					}
					break;
			}
		},
		/* -------------------- */
		
		
		/* calls the update method automatically */
		_autoUpdate=function(rem){
			var $this=$(this),d=$this.data(pluginPfx),o=d.opt,
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container");
			if(rem){
				/* 
				removes autoUpdate timer 
				usage: functions._autoUpdate.call(this,"remove");
				*/
				clearTimeout(mTS_container[0].autoUpdate);
				_delete(mTS_container[0],"autoUpdate");
				return;
			}
			var	oldSelSize=sizesSum(),newSelSize,
				os=[mTS_container.height(),mTS_container.width(),mTS_wrapper.height(),mTS_wrapper.width(),$this.height(),$this.width()],ns,
				oldImgsLen=imgSum(),newImgsLen;
			upd();
			function upd(){
				clearTimeout(mTS_container[0].autoUpdate);
				if($this.parents("html").length===0){
					/* check element in dom tree */
					$this=null;
					return;
				}
				mTS_container[0].autoUpdate=setTimeout(function(){
					/* update on specific selector(s) length and size change */
					if(o.advanced.updateOnSelectorChange){
						newSelSize=sizesSum();
						if(newSelSize!==oldSelSize){
							doUpd();
							oldSelSize=newSelSize;
							return;
						}
					}
					/* update on main element and scroller size changes */
					if(o.advanced.updateOnContentResize){
						ns=[mTS_container.height(),mTS_container.width(),mTS_wrapper.height(),mTS_wrapper.width(),$this.height(),$this.width()];
						if(ns[0]!==os[0] || ns[1]!==os[1] || ns[2]!==os[2] || ns[3]!==os[3] || ns[4]!==os[4] || ns[5]!==os[5]){
							doUpd();
							os=ns;
						}
					}
					/* update on image load */
					if(o.advanced.updateOnImageLoad){
						newImgsLen=imgSum();
						if(newImgsLen!==oldImgsLen){
							mTS_container.find("img").each(function(){
								imgLoader(this.src);
							});
							oldImgsLen=newImgsLen;
						}
					}
					if(o.advanced.updateOnSelectorChange || o.advanced.updateOnContentResize || o.advanced.updateOnImageLoad){upd();}
				},60);
			}
			/* returns images amount */
			function imgSum(){
				var total=0
				if(o.advanced.updateOnImageLoad){total=mTS_container.find("img").length;}
				return total;
			}
			/* a tiny image loader */
			function imgLoader(src){
				var img=new Image();
				function createDelegate(contextObject,delegateMethod){
					return function(){return delegateMethod.apply(contextObject,arguments);}
				}
				function imgOnLoad(){
					this.onload=null;
					doUpd();
				}
				img.onload=createDelegate(img,imgOnLoad);
				img.src=src;
			}
			/* returns the total height and width sum of all elements matching the selector */
			function sizesSum(){
				if(o.advanced.updateOnSelectorChange===true){o.advanced.updateOnSelectorChange="*";}
				var total=0,sel=mTS_container.find(o.advanced.updateOnSelectorChange);
				if(o.advanced.updateOnSelectorChange && sel.length>0){sel.each(function(){total+=$(this).height()+$(this).width();});}
				return total;
			}
			/* calls the update method */
			function doUpd(){
				clearTimeout(mTS_container[0].autoUpdate); 
				methods.update.call(null,$this[0]);
			}
		},
		/* -------------------- */
		
		
		/* stops content animations */
		_stop=function(el){
			var d=el.data(pluginPfx),
				sel=$("#mTS_"+d.idx+"_container");
			sel.each(function(){
				_stopTween.call(this);
			});
		},
		/* -------------------- */
		
		
		/* 
		ANIMATES CONTENT 
		This is where the actual scrolling happens
		*/
		_scrollTo=function(el,to,options){
			var d=el.data(pluginPfx),o=d.opt,
				defaults={
					trigger:"internal",
					dir:"y",
					easing:"easeOut",
					dur:o.speed*60,
					overwrite:"all",
					callbacks:true,
					onStart:true,
					onUpdate:true,
					onComplete:true
				},
				options=$.extend(defaults,options),
				mTS_wrapper=$("#mTS_"+d.idx),
				mTS_container=$("#mTS_"+d.idx+"_container"),
				totalScrollOffsets=o.callbacks.onTotalScrollOffset ? _arr.call(el,o.callbacks.onTotalScrollOffset) : [0,0],
				totalScrollBackOffsets=o.callbacks.onTotalScrollBackOffset ? _arr.call(el,o.callbacks.onTotalScrollBackOffset) : [0,0];
			d.trigger=options.trigger;
			if(mTS_wrapper.scrollTop()!==0 || mTS_wrapper.scrollLeft()!==0){ /* always reset scrollTop/Left */
				mTS_wrapper.scrollTop(0).scrollLeft(0);
			}
			switch(options.dir){
				case "x":
					var property="left",
						contentPos=mTS_container[0].offsetLeft,
						limit=mTS_wrapper.width()-mTS_container.width(),
						scrollTo=to,
						tso=totalScrollOffsets[1],
						tsbo=totalScrollBackOffsets[1],
						totalScrollOffset=tso>0 ? tso : 0,
						totalScrollBackOffset=tsbo>0 ? tsbo : 0;
					break;
				case "y":
					var property="top",
						contentPos=mTS_container[0].offsetTop,
						limit=mTS_wrapper.height()-mTS_container.height(),
						scrollTo=to,
						tso=totalScrollOffsets[0],
						tsbo=totalScrollBackOffsets[0],
						totalScrollOffset=tso>0 ? tso : 0,
						totalScrollBackOffset=tsbo>0 ? tsbo : 0;
					break;
			}
			if(scrollTo>=0){
				scrollTo=0;
				_buttonsVisibility.call(el,false,1,options.dir); /* show/hide buttons */
			}else if(scrollTo<=limit){
				scrollTo=limit;
				_buttonsVisibility.call(el,false,2,options.dir); /* show/hide buttons */
			}else{
				scrollTo=scrollTo;
				_buttonsVisibility.call(el,false,0,options.dir); /* show/hide buttons */
			}
			if(!el[0].mts){ 
				_mts(); /* init mts object (once) to make it available before callbacks */
				if(_cb("onInit")){o.callbacks.onInit.call(el[0]);} /* callbacks: onInit */
			}
			clearTimeout(mTS_container[0].onCompleteTimeout);
			if(!d.tweenRunning && ((contentPos===0 && scrollTo>=0) || (contentPos===limit && scrollTo<=limit))){return;}
			_tweenTo(mTS_container[0],property,Math.round(scrollTo),options.dur,options.easing,options.overwrite,{
				onStart:function(){
					if(options.callbacks && options.onStart && !d.tweenRunning){
						/* callbacks: onScrollStart */
						if(_cb("onScrollStart")){_mts(); o.callbacks.onScrollStart.call(el[0]);}
						d.tweenRunning=true;
						d.cbOffsets=_cbOffsets();
					}
				},onUpdate:function(){
					if(options.callbacks && options.onUpdate){
						/* callbacks: whileScrolling */
						if(_cb("whileScrolling")){_mts(); o.callbacks.whileScrolling.call(el[0]);}
					}
				},onComplete:function(){
					if(options.callbacks && options.onComplete){
						if(o.axis==="yx"){clearTimeout(mTS_container[0].onCompleteTimeout);}
						var t=mTS_container[0].idleTimer || 0;
						mTS_container[0].onCompleteTimeout=setTimeout(function(){
							/* callbacks: onScroll, onTotalScroll, onTotalScrollBack */
							if(_cb("onScroll")){_mts(); o.callbacks.onScroll.call(el[0]);}
							if(_cb("onTotalScroll") && scrollTo<=limit+totalScrollOffset && d.cbOffsets[0]){_mts(); o.callbacks.onTotalScroll.call(el[0]);}
							if(_cb("onTotalScrollBack") && scrollTo>=-totalScrollBackOffset && d.cbOffsets[1]){_mts(); o.callbacks.onTotalScrollBack.call(el[0]);}
							d.tweenRunning=false;
							mTS_container[0].idleTimer=0;
						},t);
					}
				}
			});
			/* checks if callback function exists */
			function _cb(cb){
				return d && o.callbacks[cb] && typeof o.callbacks[cb]==="function";
			}
			/* checks whether callback offsets always trigger */
			function _cbOffsets(){
				return [o.callbacks.alwaysTriggerOffsets || contentPos>=limit+tso,o.callbacks.alwaysTriggerOffsets || contentPos<=-tsbo];
			}
			/* 
			populates object with useful values for the user 
			values: 
				content: this.mts.content
				content top position: this.mts.top 
				content left position: this.mts.left 
				scrolling y percentage: this.mts.topPct 
				scrolling x percentage: this.mts.leftPct 
				scrolling direction: this.mts.direction
			*/
			function _mts(){
				var cp=[mTS_container[0].offsetTop,mTS_container[0].offsetLeft], /* content position */
					cl=[mTS_container.height(),mTS_container.width()], /* content length */
					pl=[mTS_wrapper.height(),mTS_wrapper.width()]; /* content parent length */
				el[0].mts={
					content:mTS_container, /* original content wrapper as jquery object */
					top:cp[0],left:cp[1],
					topPct:Math.round((100*Math.abs(cp[0]))/(Math.abs(cl[0])-pl[0])),leftPct:Math.round((100*Math.abs(cp[1]))/(Math.abs(cl[1])-pl[1])),
					direction:options.dir
				};
				/* 
				this refers to the original element containing the scroller
				usage: this.mts.top, this.mts.leftPct etc. 
				*/
			}
		},
		/* -------------------- */
		
		
		/* 
		CUSTOM JAVASCRIPT ANIMATION TWEEN 
		Lighter and faster than jquery animate() and css transitions 
		Animates top/left properties and includes easings 
		*/
		_tweenTo=function(el,prop,to,duration,easing,overwrite,callbacks){
			if(!el._mTween){el._mTween={top:{},left:{}};}
			var callbacks=callbacks || {},
				onStart=callbacks.onStart || function(){},onUpdate=callbacks.onUpdate || function(){},onComplete=callbacks.onComplete || function(){},
				startTime=_getTime(),_delay,progress=0,from=el.offsetTop,elStyle=el.style,_request,tobj=el._mTween[prop];
			if(prop==="left"){from=el.offsetLeft;}
			var diff=to-from;
			tobj.stop=0;
			if(overwrite!=="none"){_cancelTween();}
			_startTween();
			function _step(){
				if(tobj.stop){return;}
				if(!progress){onStart.call();}
				progress=_getTime()-startTime;
				_tween();
				if(progress>=tobj.time){
					tobj.time=(progress>tobj.time) ? progress+_delay-(progress-tobj.time) : progress+_delay-1;
					if(tobj.time<progress+1){tobj.time=progress+1;}
				}
				if(tobj.time<duration){tobj.id=_request(_step);}else{onComplete.call();}
			}
			function _tween(){
				if(duration>0){
					tobj.currVal=_ease(tobj.time,from,diff,duration,easing);
					elStyle[prop]=Math.round(tobj.currVal)+"px";
				}else{
					elStyle[prop]=to+"px";
				}
				onUpdate.call();
			}
			function _startTween(){
				_delay=1000/60;
				tobj.time=progress+_delay;
				_request=(!window.requestAnimationFrame) ? function(f){_tween(); return setTimeout(f,0.01);} : window.requestAnimationFrame;
				tobj.id=_request(_step);
			}
			function _cancelTween(){
				if(tobj.id==null){return;}
				if(!window.requestAnimationFrame){clearTimeout(tobj.id);
				}else{window.cancelAnimationFrame(tobj.id);}
				tobj.id=null;
			}
			function _ease(t,b,c,d,type){
				switch(type){
					case "linear":
						return c*t/d + b;
						break;
					case "linearOut":
						t/=d; t--; return c * Math.sqrt(1 - t*t) + b;
						break;
					case "easeInOutSmooth":
						t/=d/2;
						if(t<1) return c/2*t*t + b;
						t--;
						return -c/2 * (t*(t-2) - 1) + b;
						break;
					case "easeInOutStrong":
						t/=d/2;
						if(t<1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
						t--;
						return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
						break;
					case "easeInOut":
						t/=d/2;
						if(t<1) return c/2*t*t*t + b;
						t-=2;
						return c/2*(t*t*t + 2) + b;
						break;
					case "easeOutSmooth":
						t/=d; t--;
						return -c * (t*t*t*t - 1) + b;
						break;
					case "easeOutStrong":
						return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
						break;
					case "easeOut": default:
						var ts=(t/=d)*t,tc=ts*t;
						return b+c*(0.499999999999997*tc*ts + -2.5*ts*ts + 5.5*tc + -6.5*ts + 4*t);
				}
			}
		},
		/* -------------------- */
		
		
		/* returns current time */
		_getTime=function(){
			if(window.performance && window.performance.now){
				return window.performance.now();
			}else{
				if(window.performance && window.performance.webkitNow){
					return window.performance.webkitNow();
				}else{
					if(Date.now){return Date.now();}else{return new Date().getTime();}
				}
			}
		},
		/* -------------------- */
		
		
		/* stops a tween */
		_stopTween=function(){
			var el=this;
			if(!el._mTween){el._mTween={top:{},left:{}};}
			var props=["top","left"];
			for(var i=0; i<props.length; i++){
				var prop=props[i];
				if(el._mTween[prop].id){
					if(!window.requestAnimationFrame){clearTimeout(el._mTween[prop].id);
					}else{window.cancelAnimationFrame(el._mTween[prop].id);}
					el._mTween[prop].id=null;
					el._mTween[prop].stop=1;
				}
			}
		},
		/* -------------------- */
		
		
		/* deletes a property (avoiding the exception thrown by IE) */
		_delete=function(c,m){
			try{delete c[m];}catch(e){c[m]=null;}
		},
		/* -------------------- */
		
		
		/* detects left mouse button */
		_mouseBtnLeft=function(e){
			return !(e.which && e.which!==1);
		},
		/* -------------------- */
		
		
		/* detects if pointer type event is touch */
		_pointerTouch=function(e){
			var t=e.originalEvent.pointerType;
			return !(t && t!=="touch" && t!==2);
		},
		/* -------------------- */
		
		
		/* checks if value is numeric */
		_isNumeric=function(val){
			return !isNaN(parseFloat(val)) && isFinite(val);
		};
		/* -------------------- */
		
	
	
	
	
	/* 
	----------------------------------------
	PLUGIN SETUP 
	----------------------------------------
	*/
	
	/* plugin constructor functions */
	$.fn[pluginNS]=function(method){ /* usage: $(selector).fn(); */
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	$[pluginNS]=function(method){ /* usage: $.fn(); */
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	
	/* 
	allow setting plugin default options. 
	usage: $.mThumbnailScroller.defaults.speed=15; 
	to apply any changed default options on default selectors (below), use inside document ready fn 
	e.g.: $(document).ready(function(){ $.mThumbnailScroller.defaults.speed=15; });
	*/
	$[pluginNS].defaults=defaults;
	
	/* 
	add window object (window.mThumbnailScroller) 
	usage: if(window.mThumbnailScroller){console.log("plugin script loaded");}
	*/
	window[pluginNS]=true;
	
	/* call plugin fn automatically on default selector with HTML data attributes */
	$(window).load(function(){
		var elems=$(defaultSelector),instances=[];
		if(elems.length){
			elems.each(function(){
				var elem=$(this),axis=elem.data("mts-axis") || defaults.axis,type=elem.data("mts-type") || defaults.type,theme=elem.data("mts-theme") || defaults.theme,
					elemClass="auto-"+pluginPfx+"-"+axis+"-"+type+"-"+theme,instance=[elemClass,axis,type];
				elem.addClass(elemClass);
				if($.inArray(elemClass,instances)===-1){
					instances.push(instance);
				}
			});
			for(var i=0; i<instances.length; i++){
				$("."+instances[i][0])[pluginNS]({axis:instances[i][1],type:instances[i][2]}); 
			}
		}
	});
	
})(jQuery,window,document);