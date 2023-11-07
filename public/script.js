const btn=document.querySelectorAll('btn')
button.addEventListener('click',()=>{
    alert("Button clicked")
})
// initial scroll position
let scrollPos = window.pageYOffset;

// on scroll, this function is called
window.addEventListener('scroll', function() {

  // detects new state and compares it with the new one
  if ((document.body.getBoundingClientRect()).top > scrollPos) {
    // shows the navbar when scroll up
    document.getElementById('navbar').style.visibility = 'visible';
  } else {
    // hides the navbar when scroll down
    document.getElementById('navbar').style.visibility = 'hidden';
  }

  // saves the new position for iteration.
  scrollPos = (document.body.getBoundingClientRect()).top;
});

