import React, { useEffect, useState } from 'react'
//require bootstrap
import { Form } from 'react-bootstrap'

export const GInputNumber = ({ name, initialValue, className, onChange, readOnly }) => {
    const [defaultValue, setDefaultValue] = useState()

    useEffect(() => {
        setDefaultValue(format(initialValue))
        // initialValue = format(initialValue)
        // console.log(initialValue)
    }, [initialValue])

    function format(amount, decimalCount = 0, decimal = ".", thousands = ",") {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;


        var rtn = negativeSign +
            (j ? i.substring(0, j) + thousands : '') +
            i.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
            (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");

        return rtn;
    }

    const handleOnBlur = (e) => {
        var str = e.target.value
        var strFormated = format(parseFloat(str))

        setDefaultValue(strFormated)

        e.target.value = strFormated
        
        onChange(e)
    }

    const handleOnChange = (e) => {
        onChange(e)
    }

    const handleOnFocus = (e) => {
        var str = e.target.value.replace(/,/g, '')
        setDefaultValue(str)

        e.target.value = str
        
        onChange(e)
    }

    const handleOnKeyDown = (e) => {
        var evt = e || window.event;
        var test =( evt.ctrlKey || evt.altKey 
            || (47<evt.keyCode && evt.keyCode<58 && evt.shiftKey===false) 
            || (95<evt.keyCode && evt.keyCode<106)
            || (evt.keyCode===8) || (evt.keyCode===9) 
            || (evt.keyCode>34 && evt.keyCode<40) 
            || (evt.keyCode===46) 
            || (evt.keyCode===189)
            || (evt.keyCode===109))
            
        // Handle paste
        var key
        if (evt.type === 'paste') {
            key = e.clipboardData.getData('text/plain')
        } else {
            // Handle key press
            key = evt.keyCode || evt.which
            key = String.fromCharCode(key)
        }
        var regex = /[0-9]|\./
        if (!regex.test(key) && !test) {
            evt.returnValue = false
            if (evt.preventDefault) evt.preventDefault()
        }
    }

    return (
        <Form.Control
            type="text" 
            name={name} 
            defaultValue={defaultValue}
            className={className +' text-end'} 
            onKeyDown={handleOnKeyDown}
            onChange={handleOnChange}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            readOnly={readOnly}
        />
    )
}