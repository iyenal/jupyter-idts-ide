const config = {
  settings: {
    showPopoutIcon: false,
    showMaximiseIcon: false,
    showCloseIcon: false
  },
  content: [{
    type: 'row',
    content: [
      {
        type: 'component',
        componentName: 'output',
        componentState: { id: 'output1', title: 'Sine Wave Plot' }
      },
      {
        type: 'component',
        componentName: 'output',
        componentState: { id: 'output2', title: 'Data Table' }
      },
      {
        type: 'component',
        componentName: 'output',
        componentState: { id: 'output3', title: 'Box Plot' }
      }
    ]
  }]
};

const myLayout = new GoldenLayout(config, document.getElementById('layout-container'));

// Register component that will receive Jupyter outputs
myLayout.registerComponent('output', function(container, state) {
  container.getElement().html(`<div class="output-container">
    <h3>${state.title}</h3>
    <div id="${state.id}"></div>
  </div>`);
});

// Initialize layout
myLayout.init();

// Handle window resize
window.addEventListener('resize', () => {
  myLayout.updateSize();
});

// Listen for messages from Jupyter notebook iframe
window.addEventListener('message', (event) => {
  // Handle messages from JupyterLite iframe
  if (event.data && event.data.type === 'jupyter-output') {
    const { divId, content } = event.data;
    const outputDiv = document.getElementById(divId);
    if (outputDiv) {
      outputDiv.innerHTML = content;
      console.log(`Updated ${divId} with new content`);
    }
  }
});