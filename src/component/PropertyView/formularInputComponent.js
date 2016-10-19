/**
 * Created by Brian on 19/10/2016.
 */

import React from 'react';

const inputType = {
    value: 1,
    formula: 2,
};

class FormularInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: inputType.value,
        }
    }


    render() {

        let formulaWidget = (
            <div>
                formula
            </div>
        );

        let valueWidget = (
            <div>
                value
            </div>
        );


        return (
            <div className='formularInput'>
                {
                    this.state.type === inputType.value
                        ? valueWidget
                        : formulaWidget
                }
            </div>
        );
    }
}

export {FormularInput};
