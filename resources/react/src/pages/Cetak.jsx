import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import { Components } from '../utils/IndexToPrint'
import { PDFViewer, StyleSheet } from '@react-pdf/renderer';

export const Cetak = () => {
    const [searchParams] = useSearchParams();
    const toPrint = searchParams.get('toprint')
    const id = searchParams.get('id')
    const ComponentToPrint = Components[searchParams.get('toprint')]

    const styles = StyleSheet.create({
        viewer: {
            width: '100%', //the pdf viewer will take up all of the width and height
            height: window.innerHeight - 5,
        },
    });

    return (
        <ComponentToPrint id={id} />
    )
}
