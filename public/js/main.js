// The interval id for the planchette moving function
var intId;
function move(x, y) {
    var newx = parseInt($("#planchette").css("left")) + x;
    var newy = parseInt($("#planchette").css("top")) + y;
    // Wrap around the boundary
    var cont_width = $("#board_container").width();
    var cont_height = $("#board_container").height();
    var plan_width = $("#planchette").width();
    var plan_height = $("#planchette").height();
    newx = (newx < 0) ? -newx : newx;
    newy = (newy < 0) ? -newy : newy;
    newx = (newx + plan_width  > cont_width) ? newx - (2 * (newx + plan_width - cont_width)) : newx;
    newy = (newy + plan_height  > cont_height) ? newy - (2 * (newy + plan_height - cont_height)) : newy;
    $("#planchette").css("left", newx);
    $("#planchette").css("top", newy);
}

$(document).ready(function () {
    var running = false;
    $("#acronym_form").submit(function (evt) {
        evt.preventDefault();
        if (!running)
        {
            var stock = $("#stock_name").val();
            if(stock == "") {
                alert("Please enter a stock acronym");
            }
            var cont_width = $("#board_container").width();
            var cont_height = $("#board_container").height();
            var plan = $("#planchette");
            plan.css("top", (cont_height * 0.2) + "px");
            plan.css("left", (cont_width * 0.5 - plan.width() * 0.5) + "px");
            plan.show();
            $("#go_btn").attr("value", "Stop!");
            movePlanchette(stock, 1, true);
            running = true;
        }
        else {
            $("#go_btn").attr("value", "Go!");
            clearInterval(intId);
            running = false;
        }
        return false;
    });
});

function movePlanchette(stock, page, firstCall) {
    $.get("/priceChanges/" + stock + "/?page=" + page, null, function(resp, status, jqXHR) {

        if (resp.length == 0 && firstCall) {
            alert("Unable to find symbol");
            $("#go_btn").attr("value", "Go!");
            running = false;
            return;
        }
        else if (resp.length == 0) {
            // If there's no more data, cycle back from the front 
            movePlanchette(stock, 1);
            return;
        }

        if (firstCall) {
            // Use the first element's data to get the initial position
            var x =('0.'+Math.sin(resp[0].change).toString().substr(6));
            var y =('0.'+Math.sin(x).toString().substr(6));

            var cont_width = $("#board_container").width();
            var cont_height = $("#board_container").height();
            var plan = $("#planchette");
            $("#planchette").css("left", (x * (cont_width - plan.width())) + "px");
            $("#planchette").css("top", (y * (cont_height - plan.height())) + "px");
        }

        var index = 0;
        intId = setInterval(moveEveryOther, 100);
        function moveEveryOther() {
            console.log("moving, index:" + index);
            // If we've used all the data, get more
            if (index >= resp.length) {
                console.log("hit end");
                clearInterval(intId);
                movePlanchette(stock, page + 1);
            }

            // Change the little ticker text
            var change = resp[index].change;
            var date = new Date(resp[index].date);
            $("#date").text(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
            var sign;
            if (change > 0){
                sign = "+";
                $("#change").css("color","green");
            }
            else {
                sign = "-";
                $("#change").css("color","red");
            }
            $("#change").text(sign + change + "%");

            // Normalize the change so the planchette actually moves
            var cont_width = $("#board_container").width();
            change *= cont_width;

            // Move the planchette
            if (index % 2 == 0)
                move(change, 0);
            else
                move(0, change);
            index += 1;
        }
    });
}
