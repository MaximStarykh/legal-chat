/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// CSS Modules
interface CSSModuleClasses {
  [key: string]: string;
}

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}

// For vanilla CSS files
declare module '*.css' {
  const content: string;
  export default content;
}
