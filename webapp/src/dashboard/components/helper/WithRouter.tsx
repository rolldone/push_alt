import React from 'react';
import { NavigateFunction, useParams } from 'react-router-dom';

interface propsInterface {
  [key: string]: any
  component: React.ComponentClass<any>
}


const WithRouter = (props: propsInterface) => {
  const params = useParams();
  let GG = props.component as React.ComponentClass<any>;
  return <GG {...{ ...props, match: { params } }} />
}

export default WithRouter