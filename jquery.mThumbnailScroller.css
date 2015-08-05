/*
== jquery thumbnail/image scroller ==
Plugin URI: http://manos.malihu.gr/jquery-thumbnail-scroller/
*/



/*
CONTENTS: 
	1. BASIC STYLE - Plugin's basic/essential CSS properties (normally, should not be edited). 
	2. SCROLLING BUTTONS STYLE - buttons size, background, color, positioning etc. 
	3. THUMBNAILS STYLE - basic thumbnails CSS.
	4. THEMES - Scroller colors, dimensions, backgrounds etc. via ready-to-use themes. 
*/



/* 
------------------------------------------------------------------------------------------------------------------------
1. BASIC STYLE  
------------------------------------------------------------------------------------------------------------------------
*/

	.mThumbnailScroller{ -ms-touch-action: none; touch-action: none; /* MSPointer events - direct all pointer events to js */ }
	.mThumbnailScroller.mTS_no_scroll, .mThumbnailScroller.mTS_touch_action{ -ms-touch-action: auto; touch-action: auto; }

	.mTSWrapper{
		position: relative;
		overflow: hidden;
		height: 100%;
		max-width: 100%;
		outline: none;
		direction: ltr;
	}

	.mTSContainer{
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	ul.mTSContainer, ol.mTSContainer{ list-style: none; }

	.mTSThumb, 
	ul.mTSContainer > li img{ vertical-align: bottom; }

	.mTS_vertical .mTSContainer{
		margin-top: 0 !important;
		margin-bottom: 0 !important;
	}

	.mTS_horizontal .mTSContainer{
		margin-left: 0 !important;
		margin-right: 0 !important;
	}



/* 
------------------------------------------------------------------------------------------------------------------------
2. SCROLLING BUTTONS STYLE  
------------------------------------------------------------------------------------------------------------------------
*/

	.mTSButton{
		/* button size (if changed, also change the buttons top and left margins below) */
		width: 20px;
		height: 20px;
		line-height: 20px;
		padding: 14px;
		/* ---------- */
		overflow: hidden;
		text-align: center;
		background-color: #000; /* button background */
		color: #fff; /* non-svg button icon color */
		display: inline-block;
		position: absolute;
		top: 0;
		left: 0;
		/* show button effect (fades-in button from zero size) */
		opacity: 1;
		-webkit-transition: height 0s ease-out 0s, width 0s ease-out 0s, padding 0s ease-out 0s, opacity .2s ease-out 0s;
		-moz-transition: height 0s ease-out 0s, width 0s ease-out 0s, padding 0s ease-out 0s, opacity .2s ease-out 0s;
		-o-transition: height 0s ease-out 0s, width 0s ease-out 0s, padding 0s ease-out 0s, opacity .2s ease-out 0s;
		-ms-transition: height 0s ease-out 0s, width 0s ease-out 0s, padding 0s ease-out 0s, opacity .2s ease-out 0s;
		transition: height 0s ease-out 0s, width 0s ease-out 0s, padding 0s ease-out 0s, opacity .2s ease-out 0s;
		/* ---------- */
	}

	/* buttons positioning */
	
	.mTSButtonDown{
		top: auto;
		bottom: 0;
	}

	.mTSButtonRight{
		left: auto;
		right: 0;
	}

	.mTSButtonUp, 
	.mTSButtonDown{ /* margin is half the button size */
		left: 50%;
		margin-left: -24px;
	}

	.mTSButtonLeft, 
	.mTSButtonRight{ /* margin is half the button size */
		top: 50%;
		margin-top: -24px;
	}

	.mTSButtonIconContainer{
		display: inline-block;
		position: relative;
		width: 100%;
		padding-bottom: 100%;
		overflow: hidden;
	}

	.mTSButtonIcon{ /* SVG icon */
		display: inline-block;
		fill: #fff; /* button icon color */
		position: absolute;
	    top: 0;
	    left: 0;
	}

	.mTSButton.mTS-hidden, 
	.mThumbnailScroller.mTS_no_scroll .mTSButton{
		/* hide button effect (fades-out button to zero size) */
		opacity: 0;
		height: 0;
		width: 0;
		padding: 0;
		-webkit-transition: height 0s ease-out .2s, width 0s ease-out .2s, padding 0s ease-out .2s, opacity .2s ease-out;
		-moz-transition: height 0s ease-out .2s, width 0s ease-out .2s, padding 0s ease-out .2s, opacity .2s ease-out;
		-o-transition: height 0s ease-out .2s, width 0s ease-out .2s, padding 0s ease-out .2s, opacity .2s ease-out;
		-ms-transition: height 0s ease-out .2s, width 0s ease-out .2s, padding 0s ease-out .2s, opacity .2s ease-out;
		transition: height 0s ease-out .2s, width 0s ease-out .2s, padding 0s ease-out .2s, opacity .2s ease-out;
		/* ---------- */
	}



/* 
------------------------------------------------------------------------------------------------------------------------
3. THUMBNAILS STYLE  
------------------------------------------------------------------------------------------------------------------------
*/

	/* thumbnail container (default: li) */
	
	.mTS_horizontal .mTSThumbContainer, 
	.mTS_horizontal ul.mTSContainer > li{ float: left; }



/* 
------------------------------------------------------------------------------------------------------------------------
4. THEMES 
------------------------------------------------------------------------------------------------------------------------
*/

	/* theme: "buttons-in" */

	.mTS-buttons-in{
		padding: 14px;
		background-color: #000; 
	}

	.mTS-buttons-in .mTSButtonIcon{ fill: #fff; }

	.mTS-buttons-in .mTSWrapper, 
	.mTS-buttons-in .mTSButton{ background-color: inherit; }

	.mTS-buttons-in .mTSButtonLeft, 
	.mTS-buttons-in .mTSButtonRight{ 
		width: 24px;
		height: 48px;
		padding: 24px 4px 0 4px;
		margin-top: -36px;
	}

	.mTS-buttons-in .mTSButtonUp, 
	.mTS-buttons-in .mTSButtonDown{ 
		width: 24px;
		height: 24px;
		padding: 4px 24px;
		margin-left: -36px; 
	}
	
	.mTS-buttons-in .mTSButton.mTS-hidden{
		height: 0;
		width: 0;
		padding: 0;
	}

	.mTS-buttons-in .mTSButton:not(.mTS-hidden){ opacity: .4; }

	.mTS-buttons-in:hover .mTSButton:not(.mTS-hidden){ opacity: 1; }

	.mTS-buttons-in .mTS_vertical .mTSThumbContainer{ margin: 14px 0; }

	.mTS-buttons-in .mTS_vertical .mTSThumbContainer:first-child{ margin-top: 0; }

	.mTS-buttons-in .mTS_vertical .mTSThumbContainer:last-child{ margin-bottom: 0; }

	.mTS-buttons-in .mTS_horizontal .mTSThumbContainer{ margin: 0 7px; }

	.mTS-buttons-in .mTS_horizontal .mTSThumbContainer:first-child{ margin-left: 0; }

	.mTS-buttons-in .mTS_horizontal .mTSThumbContainer:last-child{ margin-right: 0; }

	/* ---------------------------------------- */



	/* theme: "buttons-out" */

	.mTS-buttons-out{
		padding: 6px;
		background: #000;
	}

	.mTS-buttons-out .mTSButtonIcon{ fill: #000; }

	.mTS-buttons-out .mTSButton{
		background-color: transparent;
		width: 36px;
		height: 36px;
		line-height: 42px;
		padding: 6px;
	}
	
	.mTS-buttons-out .mTSButton.mTS-hidden{
		height: 0;
		width: 0;
		padding: 0;
	}

	.mTS-buttons-out .mTS_vertical .mTSThumbContainer{ margin: 6px 0; }

	.mTS-buttons-out .mTS_vertical .mTSThumbContainer:first-child{ margin-top: 0; }

	.mTS-buttons-out .mTS_vertical .mTSThumbContainer:last-child{ margin-bottom: 0; }

	.mTS-buttons-out .mTS_horizontal .mTSThumbContainer{ margin: 0 3px; }

	.mTS-buttons-out .mTS_horizontal .mTSThumbContainer:first-child{ margin-left: 0; }

	.mTS-buttons-out .mTS_horizontal .mTSThumbContainer:last-child{ margin-right: 0; }

	/* ---------------------------------------- */



	/* theme: "hover-full" */

	.mTS-hover-full{
		padding: 8px;
		background: rgba(0,0,0,.2);
	}

	.mTS-hover-full .mTS_vertical .mTSThumbContainer{ margin: 8px 0; }

	.mTS-hover-full .mTS_vertical .mTSThumbContainer:first-child{ margin-top: 40px; }

	.mTS-hover-full .mTS_vertical .mTSThumbContainer:last-child{ margin-bottom: 40px; }

	.mTS-hover-full .mTS_horizontal .mTSThumbContainer{ margin: 0 4px; }

	.mTS-hover-full .mTS_horizontal .mTSThumbContainer:first-child{ margin-left: 40px; }

	.mTS-hover-full .mTS_horizontal .mTSThumbContainer:last-child{ margin-right: 40px; }

	/* ---------------------------------------- */