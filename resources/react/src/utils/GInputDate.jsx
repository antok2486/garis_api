import React, { useEffect, useState } from 'react'

//require bootstrap
import { Button, Form, InputGroup, Toast, Table, Row, Col } from 'react-bootstrap'

//custom css
import './GInputDate.css'

export const GInputDate = ({ name, className, onChange, initialValue, readOnly }) => {
    const [defaultValue, setDefaultValue] = useState()
    const [showToast, setShowToast] = useState(false)
    const toggleShowToast = () => { setShowToast(!showToast) }

    const date = new Date()
    const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [year, setYear] = useState(date.getFullYear())
    const [month, setMonth] = useState(date.getMonth())
    const [day, setDay] = useState(date.getDate())
    const currentDate = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()

    useEffect(() => {
        if (initialValue) {
            setDefaultValue(initialValue)
        } else {
            var day_ = '00' +day
            var month_ = '00' + (month +1)

            day_ = day_.substring(day_.length -2)
            month_ = month_.substring(month_.length -2)

            setDefaultValue(day_ + '-' + month_ + '-' + year)
        }

    }, [day, month, year, initialValue])

    const daysInMonth = (year_, month_) => {
        return new Date(year_, month_ + 1, 0).getDate()
    }

    const firstDay = () => {
        return new Date(year, month, 1).getDay()
    }

    const handleCurrentDate = () => {
        setYear(date.getFullYear())
        setMonth(date.getMonth())
        setDay(date.getDate())
    }

    const handleDaySelected = (e, year_, month_, day_) => {
        var _day = '00' +day_
        var _month = '00' + (month_ +1)
        var e_ = e

        _day = _day.substring(_day.length -2)
        _month = _month.substring(_month.length -2)

        e_['target']['name'] = name
        e_['target']['value'] = _day +'-' +_month +'-' +year

        setDefaultValue(_day + '-' + _month + '-' + year)

        setYear(year_)
        setMonth(month_)
        setDay(day_)
        setShowToast(false)

        onChange(e_)
    }

    const CalRow = () => {
        var maxDay = daysInMonth(year, month)
        var firstDay_ = firstDay()
        var arrWeek = [0, 7, 14, 21, 28, 35]
        var arrDay = [1, 2, 3, 4, 5, 6, 7]
        return (
            <>
                {arrWeek.map(i => (
                    <tr key={i}>
                        {arrDay.map(j => {
                            var tgl = (i + j) - firstDay_
                            var textGray = ''
                            var year_ = year
                            var month_ = month

                            if (tgl < 1) {    //last month days
                                month_ = month_ - 1
                                var lastMonthDays = daysInMonth(year_, month_)
                                tgl = lastMonthDays + tgl
                                textGray = ' text-secondary'
                            } else if (tgl > maxDay) { //next month days
                                month_ = month_ + 1
                                tgl = tgl - maxDay
                                textGray = ' text-secondary'
                            }

                            if ((tgl + '/' + month_ + '/' + year_) === currentDate) {
                                textGray = textGray + ' current-date'
                            }

                            return (
                                <td key={i + '/' + j} className={'text-center' + textGray} onClick={(e) => handleDaySelected(e, year_, month_, tgl)}>{tgl}</td>
                            )
                        })}
                    </tr>
                ))}
            </>
        )
    }

    return (
        <InputGroup className={className}>
            <Form.Control type='text' name={name} defaultValue={defaultValue} onChange={(e) => onChange(e)} onFocus={toggleShowToast} readOnly={readOnly}/>
            <Button variant='primary' id={'btn' + name} onClick={() => toggleShowToast()}>
                <i className="fa-solid fa-calendar-days"></i>
            </Button>
            <Toast show={showToast} onClose={toggleShowToast} className='gcalendar'>
                <Toast.Header>
                    <Row>
                        <Col md={3}>
                            <Form.Control type='number' className='text-center' name='GYear' value={year} onChange={(e) => setYear(e.target.value)} />
                        </Col>

                        <Col md={6}>
                            <InputGroup>
                                <Button variant='primary' onClick={() => setMonth(month === 0 ? 11 : month - 1)}><i className="fa-solid fa-caret-left" /></Button>
                                <Form.Control type='text' className='text-center' name='GMonth' value={monthName[month]} readOnly />
                                <Button variant='primary' onClick={() => setMonth(month === 11 ? 0 : month + 1)}><i className="fa-solid fa-caret-right" /></Button>
                            </InputGroup>
                        </Col>

                        <Col>
                            <Button variant='primary' onClick={() => handleCurrentDate()}><i className="fa-solid fa-calendar-check" /></Button>
                        </Col>
                    </Row>
                </Toast.Header>

                <Toast.Body>
                    <Table size='sm' className='w-100'>
                        <thead className="bg-primary text-light">
                            <tr>
                                <th className='text-center'>Su</th>
                                <th className='text-center'>Mo</th>
                                <th className='text-center'>Tu</th>
                                <th className='text-center'>We</th>
                                <th className='text-center'>Th</th>
                                <th className='text-center'>Fr</th>
                                <th className='text-center'>Sa</th>
                            </tr>
                        </thead>

                        <tbody>
                            <CalRow />
                        </tbody>
                    </Table>
                </Toast.Body>

            </Toast>
        </InputGroup>
    )
}