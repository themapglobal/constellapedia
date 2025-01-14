const Swal = require('sweetalert2');
const oceanConnector = require("../connectors/ocean-data-nft");

module.exports.show = async (constellation = "", title, cb) => {


    await Swal.fire({
        title,
        allowEnterKey: false,
        showCloseButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        html: `      
        <p>Type the name of the node</p>
        <input id="node-autocomplete" type="search" dir="ltr" spellcheck=false autocorrect="off" autocomplete="off" autocapitalize="off">

    `,
        didRender: async () => {

            const autoCompleteJS = new autoComplete({
                selector: '#node-autocomplete',
                placeHolder: "Search for node name...",
                data: {
                    src: async (val) => {
                        const response = (await oceanConnector.search());
                        return response.nodes;
                    },
                    cache: false,
                    keys: ['label'],
                },
                debounce: 100,
                resultItem: {
                    element: (item, data)=>{
                        item.innerHTML = data.match;
                    },
                    highlight: {
                        render: true
                    }
                },
                events: {
                    input: {
                        selection: (event) => {
                            autoCompleteJS.input.value = event.detail.selection.value;
                            cb(event.detail.selection.value);
                            Swal.close();
                        }
                    }
                }
            });



        }
    });

};
