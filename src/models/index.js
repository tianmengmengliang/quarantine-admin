import channelsModels from '../channel/channel.exportModels.js'

const modelsArr=[].concat( channelsModels );

// console.log( modelsArr );

function injectModels(app){
    if( typeof app.model === 'function'){
        modelsArr.map((model)=>{
            app.model( model )
        })
    }
}

export {
    injectModels
}