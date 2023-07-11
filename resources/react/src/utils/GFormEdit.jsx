import axios from 'axios'
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { URL_API, GModal, GModalList } from "./Index"

export const GFormEdit = forwardRef((props, ref) => {
    const [gModal, setGModal] = useState({
        type: 'question',
        title: 'Konfirmasi',
        body: null,
        show: false,
        buttons: [],
    })
    const [gModalList, setGModalList] = useState({
        show: false,
        title: 'Pilih',
        columns: [],
        tableName: null,
        onHide: () => { setGModalList({ show: false }) },
        onClickOk: null,
        multiple: false

    })
    const token = localStorage.getItem('token')

    useImperativeHandle(ref, () => ({
        async axiosGet(tableName) {            
            try {
                const headers = {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }

                //get params
                const res = await axios.get(URL_API + tableName, { headers: headers })

                if (res.data.status === 200) {
                    return res.data
                } else {
                    console.log(res)
                    setGModal({
                        show: true,
                        type: 'information',
                        title: 'Error' + (res.data.status ? ' ' + res.data.status : ''),
                        body:  res.data.message ? res.data.message : 'Gagal mendapatkan data',
                        buttons: [{ text: 'Ok', onClick: null }]
                    })
                }

            } catch (error) {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Error',
                    body: error.response.data.message,
                    buttons: [{ text: 'Ok', onClick: null }]
                })

            }
        },

        async axiosPut(tableName, payload) {
            try {
                var config = {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                }

                const res = await axios.put(URL_API + tableName, payload, config)

                if (res.data.status === 200) {
                    return res.data
                } else {
                    let body = 'Simpan data gagal'

                    if (res.data.message) { body = res.data.message }

                    setGModal({
                        show: true,
                        type: 'information',
                        title: 'Error ' +(res.data.status ? res.data.status : ''),
                        body: body,
                        buttons: [{ text: 'Ok', onClick: null }]
                    })
                }

            } catch (error) {
                setGModal({
                    show: true,
                    type: 'information',
                    title: 'Error ' +(error.response.data.status ? error.response.data.status : ''),
                    body: error.response.data.message ? error.response.data.message : 'Gagal update / insert data',
                    buttons: [{ text: 'Ok', onClick: null }]
                })

            }
        },

        handleChangeDataHeader(e) {
            if (!props.dataHeader || !props.setDataHeader) { return }

            let temp = Object.assign({}, props.dataHeader)

            if (e.target.className === 'form-check-input' && e.target.type !== 'radio') {  //switches
                if (e.target.checked) {
                    temp[e.target.name] = 1
                } else {
                    temp[e.target.name] = 0
                }
            } else {
                temp[e.target.name] = e.target.value
            }

            props.setDataHeader(temp)

        },

        handleSubmit(e, onClickOk) {
            e.preventDefault()

            props.setValidated(false)

            const form = e.currentTarget

            if (form.checkValidity() === false) {
                props.setValidated(true)
                return false
            }

            setGModal({
                show: true,
                type: 'question',
                title: 'Konfirmasi',
                body: 'Apakah data yang diinput sudah benar ?',
                buttons: [
                    { text: 'Ya', onClick: () => onClickOk() },
                    { text: 'Tidak', onClick: null }
                ]
            })

        },

        showModal(type, title, body, onClickOk) {
            setGModal({
                show: true,
                type: type,
                title: title,
                body: body,
                buttons: [
                    { text: 'Ya', onClick: () => onClickOk() },
                    { text: 'Tidak', onClick: null }
                ]
            })

        },

        showModalList(tableName, columns, title, onSelected) {
            setGModalList({
                show: true,
                title: title,
                columns: columns,
                tableName: tableName,
                onHide: () => { setGModalList({ show: false }) },
                onClickOk: (row) => { onSelected(row) },
                multiple: false
            })

        },

    }))

    return (
        <React.Fragment>

            {props.children}

            <GModalList
                show={gModalList.show}
                title={gModalList.title}
                columns={gModalList.columns}
                tableName={gModalList.tableName}
                arrData={gModalList.arrData}
                onHide={gModalList.onHide}
                onClickOk={gModalList.onClickOk}
                multiple={false}
            />

            <GModal
                show={gModal.show}
                type={gModal.type}
                title={gModal.title}
                body={gModal.body}
                buttons={gModal.buttons}
                onHide={() => setGModal({ show: false })}
            />

        </React.Fragment>
    )
})
