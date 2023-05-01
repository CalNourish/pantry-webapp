export const markdownStyle = {
  h1: ({node, ...props}) => <h1 className='text-4xl mb-4 block tracking-wide font-bold' {...props}/>,
  h2: ({node, ...props}) => <h2 className='text-3xl mb-4 block tracking-wide font-bold' {...props}/>,
  h3: ({node, ...props}) => <h3 className='text-2xl mb-4 block tracking-wide font-bold' {...props}/>,
  h4: ({node, ...props}) => <h4 className='text-xl mb-2 font-bold' {...props}/>,
  h5: ({node, ...props}) => <h5 className='text-lg mb-2 font-bold' {...props}/>,
  h6: ({node, ...props}) => <h6 className='text-md mb-2 font-bold' {...props}></h6>,
  p: ({node, ...props}) => <p className='mb-4' {...props}/>,
  ul: ({node, ...props}) => <ul className='list-disc pl-4 space-y-2 font-normal mb-4' {...props} ordered="false"></ul>,
  ol: ({node, ...props}) => <ol className='list-decimal pl-4 space-y-2 font-normal mb-4' {...props} ordered="true"></ol>,
  a: ({node, ...props}) => <a className='text-blue-700 hover:text-blue-500' {...props}></a>,
  blockquote: ({node, ...props}) => <blockquote className='px-4 border-l-4' {...props}></blockquote>
}

export const smallMarkdownStyle = {
  h1: ({node, ...props}) => <h1 className='text-2xl mb-4 block tracking-wide font-bold' {...props}/>,
  h2: ({node, ...props}) => <h2 className='text-xl mb-4 block tracking-wide font-bold' {...props}/>,
  h3: ({node, ...props}) => <h3 className='text-lg mb-4 block tracking-wide font-bold' {...props}/>,
  h4: ({node, ...props}) => <h4 className='text-md mb-2 font-bold' {...props}/>,
  h5: ({node, ...props}) => <h5 className='text-sm mb-2 font-bold' {...props}/>,
  h6: ({node, ...props}) => <h6 className='text-sm mb-2 font-bold' {...props}></h6>,
  hr: ({node, ...props}) => <hr className='mb-2' {...props}/>,
  p: ({node, ...props}) => <p className='text-sm mb-4' {...props}/>,
  text: ({node, ...props}) => <text className='text-xs mb-4' {...props}/>,
  ul: ({node, ...props}) => <ul className='text-sm list-disc pl-4 space-y-2 font-normal mb-4 last:pb-0' {...props} ordered="false"></ul>,
  ol: ({node, ...props}) => <ol className='text-s, list-decimal pl-4 space-y-2 font-normal mb-4 last:pb-0' {...props} ordered="true"></ol>,
  a: ({node, ...props}) => <a className='text-blue-700 hover:text-blue-500' {...props}></a>,
  blockquote: ({node, ...props}) => <blockquote className='px-4 border-l-4' {...props}></blockquote>
}