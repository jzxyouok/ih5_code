import React from 'react';
import Outline from './Outline';
import ParamsPanel from './ParamsPanel';

class ObjectView extends React.Component {
        render()
        {
            return (
                <div>
                    <Outline />
                    <br />
                    <ParamsPanel />
                </div>
            );
        }

}

module.exports = ObjectView;
