var dragging = false;

function toggle() {
    const sp = event.target.id.split('-')
    console.log(sp[1] + "   " + sp[2]);
    if (dragging || event.type === "mousedown") {
        $(this).toggleClass("selected");
    }
}