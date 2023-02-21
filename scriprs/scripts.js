jQuery(function($) {
	$.fn.isOnScreen = function(padding = 0) {
		var win = $(window);
		var viewport = {
			top : win.scrollTop(),
			left : win.scrollLeft()
		};
		viewport.right = viewport.left + win.width();
		viewport.bottom = viewport.top + win.height();

		var bounds = this.offset();
		bounds.right = bounds.left + this.outerWidth();
		bounds.bottom = bounds.top + this.outerHeight();

		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom - padding));
	};
	
	//$(window).on("load", function() {
		$(".slideUp").each(function() {
			if ( $(this).isOnScreen() ) $(this).addClass("show");
		});
	//});
	$(window).scroll(function() {
		$(".slideUp").each(function() {
			if ( $(this).isOnScreen() ) $(this).addClass("show");
		});
    });
	
	if ( window.location.hash ) scroll(0,0);
	setTimeout( function() { scroll(0,0); }, 1);
	if ( window.location.hash ) {
		$('html, body').animate({
			scrollTop: $(window.location.hash).offset().top - 50 + 'px'
		}, 'slow');
	}
	
	$("header #burger").click(function() {
		if ( !$("body").hasClass("mobon") ) {
			var menucolH = 0;
			$("header #topmenu .menucol__content").each(function() {
				if ( $(this).height() > menucolH ) menucolH = $(this).height();
			});
			$("header #topmenu .menucol__content").css("height", menucolH);
			$("body").removeClass("moboff").addClass("mobon");
		}
		else {
			var timeout = 1000;
			if ( $(window).width() <= 900 )
				timeout = 0;
			$("body").addClass("moboff");
			setTimeout(function() {
				$("body").removeClass("mobon").removeClass("moboff");
				$("header #topmenu .menucol__content").css("height", "");
			}, timeout);
		}
	});
	
	
	$("header #topmenu .menucol p.menucol__title").click(function() {
		if ( $(window).width() <= 900 ) {
			var $holder = $(this).parent();
			var $links = $(this).parent().find(".menucol__links");
			if ( $holder.hasClass("opened") ) {
				$holder.removeClass("opened");
				$links.slideUp(300);
			}
			else {
				$holder.addClass("opened");
				$links.slideDown(300);
			}
		}	
	});
	
	/**************************************************/
	/******************** HOMEPAGE ********************/
	/**************************************************/
	if ( $("main").hasClass("home") ) {
		var slide_width = 0, slider_width = 0, scrollRight = true;
		$(window).on("load resize", function() {
			scrollRight = true;
			if ( $(window).width() > 600 ) {
				if ( $("main.home .prodslider").hasClass("slick-initialized") )
					$("main.home .prodslider").slick("unslick");
				slide_width = $("main.home .prodslider .prodslider__slide").first().width();
				slider_width = slide_width * $(".prodslider__slide").length;
				var currTrans = $(".prodslider").css("transform").split(/[()]/)[1];
				var posx = 0;
				if ( currTrans ) posx = Math.abs( currTrans.split(',')[4] );
				sliderScroll( -posx, 0.65 );	
			}
			else {
				if ( !$("main.home .prodslider").hasClass("slick-initialized") )
					$("main.home .prodslider").slick({
						slidesToShow: 1,
						slidesToScroll: 1,
						prevArrow: '<div class="prodslider__prev"></div>',
						nextArrow: '<div class="prodslider__next"></div>',
						autoplay: true,
						autoplaySpeed: 4000
					});
			}
			
			$("main.home .prodslider__slide").each(function() {
				var dist = $(this).find(".prodslider__descr").height();
				$(this).find(".prodslider__title").css("transform", "translateY(" + dist + "px)");
			});
		});
		
		setInterval(function() {
			if ( $(window).width() > 600 ) {
				var currTrans = $(".prodslider").css("transform").split(/[()]/)[1];
				var posx = 0;
				if ( currTrans ) posx = Math.abs( currTrans.split(',')[4] );
				var slideId = posx / slide_width;

				if ( scrollRight ) {
					if ( $("main.home .prodslider__nav div#nav_next").hasClass("off") )
						scrollRight = false;
				} else {
					if ( $("main.home .prodslider__nav div#nav_prev").hasClass("off") )
						scrollRight = true;
				}

				if ( scrollRight )
					slideId = ( slideId % 1 === 0 ) ? (slideId + 1) : Math.ceil( slideId );
				else
					slideId = ( slideId % 1 === 0 ) ? (slideId - 1) : Math.floor( slideId );
				sliderScroll( slideId * slide_width - posx, 0.65 );
			}
		}, 8000);

		$(".prodslider").on("mousewheel DOMMouseScroll", function(event) {	
			if ( $(window).width() > 600 ) {
				var delta = 0;
				if ( Math.abs(event.deltaX) == 0 ) delta = -event.deltaY * event.deltaFactor;
				else delta = event.deltaX * event.deltaFactor;
				sliderScroll( delta );
				event.preventDefault();
			}
		});
	}
	
	$(document).keydown(function(e) {
		if ( $("main").hasClass("home") && $(window).width() > 600 ) {
			switch (e.which) {
				case 37: sliderScroll( -400, 0.65 ); // left
				break; 
				case 38: sliderScroll( -400, 0.65 ); // up
				break;
				case 39: sliderScroll( 400, 0.65 ); // right
				break;
				case 40: sliderScroll( 400, 0.65 ); // down
				break;
				default: return;
			}
			e.preventDefault();
		}
	});
	
	function sliderScroll( delta, durationIn = 0.15 ) {
		var currTrans = $(".prodslider").css("transform").split(/[()]/)[1];
		var posx = 0;
		if ( currTrans ) posx = Math.abs( currTrans.split(',')[4] );
		
		if ( posx + delta >= 0 && posx + delta <= slider_width - $(window).width() ) {
			var newPos = posx + delta;
			gsap.to(".prodslider", {duration: durationIn, x: -newPos, onComplete: checkArrs(newPos)});
		}
		else if ( posx + delta < 0 ) {
			var newPos = 0;
			gsap.to(".prodslider", {duration: 0.65, x: newPos, onComplete: checkArrs(newPos)});
		}
		else if ( posx + delta > slider_width - $(window).width() ) {
			var newPos = slider_width - $(window).width();
			gsap.to(".prodslider", {duration: 0.65, x: -newPos, onComplete: checkArrs(newPos)});
		}
	}
	
	function checkArrs(newPos) {
		if ( newPos < slide_width )
			$("main.home .prodslider__nav div#nav_prev").addClass("off");
		else $("main.home .prodslider__nav div#nav_prev").removeClass("off");
		
		if ( newPos + $(window).width() > slider_width - slide_width + 1 ) // 1 - Р·Р°РїР°СЃ 
			$("main.home .prodslider__nav div#nav_next").addClass("off");
		else $("main.home .prodslider__nav div#nav_next").removeClass("off");
	}
	
	$("main.home .prodslider__nav div").click(function() {
		if ( !$(this).hasClass("off") ) {
			var currTrans = $(".prodslider").css("transform").split(/[()]/)[1];
			var posx = 0;
			if ( currTrans ) posx = Math.abs( currTrans.split(',')[4] );
			var slideId = posx / slide_width;
			if ( $(this).attr("id") == "nav_next" ) {
				if ( Math.ceil( slideId ) - slideId < 0.01 ) slideId = Math.ceil( slideId );
				slideId = ( slideId % 1 === 0 ) ? (slideId + 1) : Math.ceil( slideId );
			}
			else if ( $(this).attr("id") == "nav_prev" ) {
				if ( slideId - Math.floor( slideId ) < 0.01 ) slideId = Math.floor( slideId );
				slideId = ( slideId % 1 === 0 ) ? (slideId - 1) : Math.floor( slideId );
			}
			sliderScroll( slideId * slide_width - posx, 0.65 );
		}
	});
	
	
	/**************************************************/
	/******************** PROJECTS ********************/
	/**************************************************/
	$("main.projects .secrets__slider").slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		prevArrow: '<div class="secrets__prev"></div>',
		nextArrow: '<div class="secrets__next"></div>',
		autoplay: true,
		autoplaySpeed: 4000
	});
	
	/**************************************************/
	/********************** NEWS **********************/
	/**************************************************/
	$("main.news .newsyears__slider").slick({
		slidesToShow: 5,
		slidesToScroll: 1,
		infinite: false,
		prevArrow: '<div class="newsyears__prev"></div>',
		nextArrow: '<div class="newsyears__next"></div>',
		responsive: [
			{ breakpoint: 400, settings: { slidesToShow: 4 } }
		]
	});
	
	$(document).on("click", "main.news .newsyears__slider p:not(.curr)", function() {
		$("main.news .newsyears__slider p.curr").removeClass("curr");
		$(this).addClass("curr");
		var data = {
			"action": "loadyear",
			"year": $(this).text()
		};
		$.ajax({
			url: '/wp-admin/admin-ajax.php',
			data: data,
			type: "POST",
			success: function(data) {
				if ( data ) {
					$("main.news .news__grid").html( data );
					$(".slideUp").each(function() {
						if ( $(this).isOnScreen() ) $(this).addClass("show");
						else $(this).removeClass("show");
					});
				}
			}
		});
	});
	
	/**************************************************/
	/********************** BRAND *********************/
	/**************************************************/
	$(window).on("load resize", function() {
		$("main.brand .brand__prodcatslider").slick({
			slidesToShow: 5,
			slidesToScroll: 1,
			infinite: true,
			prevArrow: '<div class="prodcat__prev"></div>',
			nextArrow: '<div class="prodcat__next"></div>',
			responsive: [
				{ breakpoint: 1000, settings: { slidesToShow: 4 } },
				{ breakpoint: 767, settings: { slidesToShow: 3 } },
				{ breakpoint: 550, settings: { slidesToShow: 2 } },
				{ breakpoint: 400, settings: { slidesToShow: 1 } }
			]
		});
	});
	
	/*$("main.brand .brand__prodcatslider").on("afterChange", function(event, slick, current) {
		$("main.brand .brand__prodcatnav p.curr").removeClass("curr");
		$("main.brand .brand__prodcatnav p[data-id="+ current +"]").addClass("curr");
	});
	$("main.brand .brand__prodcatnav p").click(function() {
		if ( !$(this).hasClass("curr") ) {
			$("main.brand .brand__prodcatnav p.curr").removeClass("curr");
			$(this).addClass("curr");
			$("main.brand .brand__prodcatslider").slick("slickGoTo", $(this).data("id"));
		}
	});*/
	
	/**************************************************/
	/********************* PRODCAT ********************/
	/**************************************************/
	$(window).on("load", function() {
		var num_slidesToShow = 6;
		if ( $(window).width() < 850 && $(window).height() < $(window).width() ) num_slidesToShow = 1;
		
		$("main.prodcat .prodcat__navarea .prodcat__navslider").slick({
			slidesToShow: num_slidesToShow,
			slidesToScroll: 1,
			vertical: true,
			infinite: false,
			prevArrow: '<div class="prodcatnav__prev"></div>',
			nextArrow: '<div class="prodcatnav__next"></div>'
		});
	});
	
	$(window).on("resize", function() {
		if ( $("main.prodcat .prodcat__navarea .prodcat__navslider").hasClass("slick-initialized") )
			$("main.prodcat .prodcat__navarea .prodcat__navslider").slick('unslick');
		
		var num_slidesToShow = 6;
		if ( $(window).width() < 850 && $(window).height() < $(window).width() ) num_slidesToShow = 1;
		
		$("main.prodcat .prodcat__navarea .prodcat__navslider").slick({
			slidesToShow: num_slidesToShow,
			slidesToScroll: 1,
			vertical: true,
			infinite: false,
			prevArrow: '<div class="prodcatnav__prev"></div>',
			nextArrow: '<div class="prodcatnav__next"></div>'
		});
	});
	
	$("main.prodcat .prodcat__navslider p").click(function() {
		if ( !$(this).hasClass("curr") ) {
			$("main.prodcat .prodcat__navarea").removeClass("toggled");
			
			$("main.prodcat .prodcat__navslider p").addClass("blocked");
			$("main.prodcat .prodcat__addnav p").addClass("blocked");
			
			$("main.prodcat .prodcat__navslider p.curr").removeClass("curr");
			$(this).addClass("curr");
			
			$("main.prodcat .prodcat__productslider .product.curr").find(".slideUp").addClass("reverse");
			$("main.prodcat .prodcat__productslider .product").find(".slideUp").each(function() {
				$(this).removeClass("show");
			});
			
			var id = $(this).data("id");
			$("main.prodcat .prodcat__addnav p").removeClass("disabled");
			if ( id == 0 )
				$("main.prodcat .prodcat__addnav p#prev-product").addClass("disabled");
			if ( id == $("main.prodcat .product").length - 1 )
				$("main.prodcat .prodcat__addnav p#next-product").addClass("disabled");
			setTimeout(function() {
				$("main.prodcat .prodcat__productslider .reverse.slideUp").removeClass("reverse");
				$("main.prodcat .prodcat__productslider .product.curr").removeClass("curr");
				$("main.prodcat .prodcat__productslider .product[data-id="+ id +"]").addClass("curr");
				setTimeout(function() {
					$("main.prodcat .prodcat__productslider .product.curr").find(".slideUp").addClass("show");
					if ( $(window).width() < 768 ) window.scrollTo(0, 0);
				}, 1);
				$("main.prodcat .prodcat__navslider p").removeClass("blocked");
				$("main.prodcat .prodcat__addnav p").removeClass("blocked");
			}, 1000);
		}
	});
	
	$("main.prodcat .prodcat__addnav p").click(function() {
		$("main.prodcat .prodcat__navslider p").addClass("blocked");
		$("main.prodcat .prodcat__addnav p").addClass("blocked");

		var id = $("main.prodcat .prodcat__navslider p.curr").data("id");
		var newid;
		if ( $(this).attr("id") == "prev-product" ) newid = id - 1;
		else if ( $(this).attr("id") == "next-product" ) newid = id + 1;
		$("main.prodcat .prodcat__navslider p.curr").removeClass("curr");
		$("main.prodcat .prodcat__navslider p[data-id="+ newid +"]").addClass("curr");
		if ( !$("main.prodcat .prodcat__navslider p.curr").parent().hasClass("slick-active") ) {
			if ( $(this).attr("id") == "prev-product" )
				$("main.prodcat .prodcat__navslider").slick("slickPrev");
			else if ( $(this).attr("id") == "next-product" )
				$("main.prodcat .prodcat__navslider").slick("slickNext");
		}
		$("main.prodcat .prodcat__addnav p").removeClass("disabled");
		if ( newid == 0 )
			$("main.prodcat .prodcat__addnav p#prev-product").addClass("disabled");
		if ( newid == $("main.prodcat .product").length - 1 )
			$("main.prodcat .prodcat__addnav p#next-product").addClass("disabled");
		
		$("main.prodcat .prodcat__productslider .product.curr").find(".slideUp").addClass("reverse");
		$("main.prodcat .prodcat__productslider .product").find(".slideUp").each(function() {
			$(this).removeClass("show");
		});

		setTimeout(function() {
			$("main.prodcat .prodcat__productslider .reverse.slideUp").removeClass("reverse");
			$("main.prodcat .prodcat__productslider .product.curr").removeClass("curr");
			$("main.prodcat .prodcat__productslider .product[data-id="+ newid +"]").addClass("curr");
			setTimeout(function() {
				$("main.prodcat .prodcat__productslider .product.curr").find(".slideUp").addClass("show");
			}, 1);
			$("main.prodcat .prodcat__navarea .prodcat__navslider p").removeClass("blocked");
			$("main.prodcat .prodcat__addnav p").removeClass("blocked");
		}, 1000);
	});
	
	$("main.prodcat .prodcat__navarea .prodcat__navtoggler").click(function() {
		$("main.prodcat .prodcat__navarea").toggleClass("toggled");
	});
	
	
	/**************************************************/
	/********************** ABOUT *********************/
	/**************************************************/
	$("main.about .about__achievesslider").slick({
		slidesToShow: 5,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 4000,
		prevArrow: '<div class="about__prev"></div>',
		nextArrow: '<div class="about__next"></div>',
		responsive: [
			{ breakpoint: 1000, settings: { slidesToShow: 4 } },
			{ breakpoint: 767, settings: { slidesToShow: 3 } },
			{ breakpoint: 550, settings: { slidesToShow: 2 } },
			{ breakpoint: 400, settings: { slidesToShow: 1 } }
		]
	});
	
	$("main.about .sertificates__slider").slick({
		slidesToShow: 2,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 7000,
		prevArrow: '<div class="about__prev"></div>',
		nextArrow: '<div class="about__next"></div>',
		responsive: [
			{ breakpoint: 767, settings: { slidesToShow: 1 } }
		]
	});
	
	/**************************************************/
	/********************* HISTORY ********************/
	/**************************************************/
	$(window).scroll(function() {
		$("main.history .history__step .step__descr").each(function() {
			if ( $(this).isOnScreen(100) ) $(this).parent().parent().addClass("visible");
			else $(this).parent().parent().removeClass("visible");
		});
		$("main.history .history__step").removeClass("act");
		$("main.history .history__step.visible").first().addClass("act");
		
		if ( $(".leaves-fixed").length > 0 ) {
			var delta_top = $(this).scrollTop() - $(".leaves-fixed").parent().offset().top + 100;
			var delta_btm = $(this).scrollTop() + $(".leaves-fixed .after").height() + 100 - $(".leaves-fixed").parent().offset().top - $(".leaves-fixed").parent().height();
			if ( delta_top > 0 && delta_btm < 0 ) {
				$(".leaves-fixed div").css({"position":"fixed", "top":"100px", "bottom":"auto"});
			}
			else if ( delta_top <= 0 )
				$(".leaves-fixed div").css({"position":"absolute", "top":"0", "bottom":"auto"});
			else if ( delta_btm => 0 ) {
				$(".leaves-fixed .before").css({"position":"absolute", "top":"auto", "bottom":$(".leaves-fixed .after").height() - $(".leaves-fixed .before").height() + "px"});
				$(".leaves-fixed .after").css({"position":"absolute", "top":"auto", "bottom":"0"});
			}
		}
    });
	
	
	
	/**********************************************************************************************/
	/**********************************         FORMAREA         **********************************/
	/**********************************************************************************************/
	$(".formarea .formarea-btn input").on("change", function() {
		$(this).closest(".formarea-btn").find(".formarea-btn__name").text( $(this)[0].files[0].name );
    });
	
	
	/**********************************************************************************************/
	/*******************************        CAREER ACCORDION        *******************************/
	/**********************************************************************************************/
	$("main.career .vacancies .city__head").click(function() {
		$(this).closest(".city").toggleClass("open");
		if ( $(this).closest(".city").hasClass("open") )
			$(this).closest(".city").find(".city__body").slideDown(300);
		else $(this).closest(".city").find(".city__body").slideUp(300);
	});
	
	$("main.career .vacancies .city .vacancy__head").click(function() {
		$(this).closest(".vacancy").toggleClass("open");
		if ( $(this).closest(".vacancy").hasClass("open") )
			$(this).closest(".vacancy").find(".vacancy__body").slideDown(300);
		else $(this).closest(".vacancy").find(".vacancy__body").slideUp(300);
	});
	
	/**********************************************************************************************/
	$(".vacancy__btn").click(function() {
		$("body").addClass("popup-on");
		var city = $(this).closest(".city").find(".city__head p").text();
		var vacancy = $(this).closest(".vacancy").find(".vacancy__head p").text();
		$(".popup .formarea input[name='your-city']").val( city );
		$(".popup .formarea input[name='your-vacancy']").val( vacancy );
	});
	
	$(".overlay, .popup__close").click(function() {
		$("body").removeClass("popup-on");
	});
	
	/**********************************************************************************************/
	$(".wpcf7").on("wpcf7mailsent", function(e) {
		$(this).find(".formarea-btn").each(function() {
			var $filename = $(this).find(".formarea-btn__name");
			$filename.text( $filename.data("name") );
		});
	});
});