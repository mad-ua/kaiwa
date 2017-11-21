$(document).ready(function(){

	$('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	})

	$('.selec-01').selectric();



	  $.uploadPreview({
	    input_field: "#image-upload",
	    preview_box: "#image-preview",
	    label_field: "#image-label"
	  });

		$.uploadPreview({
	    input_field: "#image-upload2",
	    preview_box: "#image-preview2",
	    label_field: "#image-label2"
	  });


    $('.form-01 .box-items .text-row').each(function(e) {
      var textarea = $(this).find('textarea');
      $(this).find('textarea').on("click", function() {
         $(this).addClass('active');
      });
    });




	$("#topForm").validate({
		rules: {
				title: {
			      required: true,
			      rangelength: [1, 40]
				}
			},
			messages: {
				title: {
					required: "Required",
					rangelength: "Max 40 characters"
				}
			}
	});


	$("#NewNodeForm").validate({
		rules: {
				id: {
			      required: true
				},
				weight: {
			      required: true
				},
				seleckc: {
			      required: true
				}
			},
			messages: {
				id: {
					required: "Required",
				},
				weight: {
					required: "Required",
				},
				seleckc: {
					required: "Required",
				},
			}
	});


	$("#NewNodeForm2").validate({
		rules: {
				id2: {
			      required: true
				},
				weight2: {
			      required: true
				},
				seleckc2: {
			      required: true
				}
			},
			messages: {
				id2: {
					required: "Required",
				},
				weight2: {
					required: "Required",
				},
				seleckc2: {
					required: "Required",
				},
			}
	});


	
	$("#NewUserResponse").validate({
		rules: {
				NewUserResponseId: {
			      required: true
				},
				NewUserResponseSelect: {
			      required: true
				},
				NewUserResponseText: {
			      required: true
				}
			},
			messages: {
				NewUserResponseId: {
					required: "Required",
				},
				NewUserResponseSelect: {
					required: "Required",
				},
				NewUserResponseText: {
					required: "Required",
				},
			}
	});


});
