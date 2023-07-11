import React, { Component } from 'react'
import axios from 'axios'
import { Button, Tabs, Tab, Accordion, ProgressBar, Row, Col, Nav, Modal } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { URL_API, GModal, Components } from '../utils/Index'
import userProfile from '../assets/images/user-male.svg'

export default class Home extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showSidebar: ' show',
            tabKey: 'home',
            openedMenus: [],
            groupActive: 'Master',
            menus: [],
            menusGroup: [],
            token: localStorage.getItem('token'),
            userName: localStorage.getItem('userName'),
            modalShow: false,
            hasError: false,
            error: null,
            errorInfo: null,
            errorMenu: null
        }

    }

    static getDerivedStateFromError(error) {
        // console.log('Get Error : ')
        // console.log(error.toString())
        return { hasError: true, error: error }
    }

    componentDidMount = async () => {
        this.fetchMenu()
    }

    componentDidCatch(error, errorInfo) {
        // console.log('Error info :')
        this.setState({ 
            hasError: true, 
            error: error, 
            errorInfo: errorInfo, 
            errorMenu: this.state.tabKey 
        })
    }

    fetchMenu = async () => {
        try {
            const headers = {
                accept: 'application/json',
                Authorization: 'Bearer ' + this.state.token
            }

            const res = await axios.get(URL_API + 'menu?grup1=' + this.state.groupActive, { headers: headers });

            if (res.status === 200) {
                var temp = []
                res.data.menus.forEach(row => {
                    if (!temp.find(key => key.grup2 === row.grup2)) {
                        temp.push({ grup2: row.grup2 })
                    }
                })

                this.setState({ menusGroup: temp, menus: res.data.menus })
            }

        } catch (error) {
            console.log(error)
        }
    }

    handleLogout = async () => {
        try {
            const headers = {
                accept: 'application/json',
                Authorization: 'Bearer ' + this.state.token
            }

            const res = await axios.get(URL_API + 'logout', { headers: headers });

            if (res.data.status === 200) {
                localStorage.clear()

                this.setState({ token: null })
                console.log(this.state.token)
            }

        } catch (error) {
            console.log(error)

        }
    }

    handleShowSidebar = () => {
        if (this.state.showSidebar === ' show') {
            this.setState({ showSidebar: ' hide' })

        } else {
            this.setState({ showSidebar: ' show' })

        }
    }

    handleCloseAllMenu = () => {
        this.setState({ openedMenus: [], tabKey: 'home' })
    }

    handleCloseMenu = () => {
        var temp = []
        var tabKey = 'home'

        this.state.openedMenus.forEach(menu => {
            if (menu.name !== this.state.tabKey) {
                temp.push(menu)
                tabKey = menu.name
            }
        })

        this.setState({ openedMenus: temp, tabKey: tabKey })
    }

    openMenu = (title, name, grup2) => {
        let temp = this.state.openedMenus.slice()
        let approval = grup2 === 'Approval' ? true : false

        if (temp.length === 0 || !temp.find(key => key.name === name)) {
            temp.push({ 'title': title, 'name': name, 'approval': approval })

            this.setState({ openedMenus: temp })
        }

        this.setState({ tabKey: name })

    }

    Sidebar = () => {
        return (
            <div className={'sidebar d-flex flex-column bg-primary text-light' + this.state.showSidebar}>
                <div className='text-center mb-2'>
                    <h5><i>your</i> <b>Brand</b></h5>
                </div>

                <hr></hr>

                <div className='mb-2'>
                    <Row>
                        <Col className='text-start'>
                            <Button type='button' variant='primary' title='Edit Profil'>
                                <i className="fa-solid fa-wrench"></i>
                            </Button>
                        </Col>
                        <Col className='text-center'>
                            <img className='user-profile mb-2' src={userProfile} />
                        </Col>
                        <Col className='text-end'>
                            <Button type='button' variant='primary' title='Logout' onClick={() => this.setState({ modalShow: true })}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='text-center'>
                            <div>{this.state.userName}</div>
                        </Col>
                    </Row>
                </div>

                <hr></hr>

                <Row>
                    <Col className='text-center menu-group'>
                        <Button type='button' variant='primary' onClick={() => this.setState({ groupActive: 'Master' }, () => { this.fetchMenu() })}>
                            <i className="fa-solid fa-database d-block"></i>
                            Master
                        </Button>
                    </Col>
                    <Col className='text-center menu-group'>
                        <Button type='button' variant='primary' onClick={() => this.setState({ groupActive: 'Transaksi' }, () => { this.fetchMenu() })}>
                            <i className="fa-solid fa-calculator d-block"></i>
                            Transaksi
                        </Button>
                    </Col>
                    <Col className='text-center menu-group'>
                        <Button type='button' variant='primary' onClick={() => this.setState({ groupActive: 'Laporan' }, () => { this.fetchMenu() })}>
                            <i className="fa-solid fa-file-lines d-block"></i>
                            Laporan
                        </Button>
                    </Col>
                </Row>

                <hr></hr>

                <Accordion>
                    {this.state.menusGroup.map((row, i) => (
                        <Accordion.Item eventKey={i} key={i}>
                            <Accordion.Header>{row.grup2}</Accordion.Header>
                            <Accordion.Body>
                                {this.state.menus.filter(key => key.grup2 === row.grup2).map((rowMenu, j) => (
                                    <span className='menu-item text-dark' onClick={() => this.openMenu(rowMenu.nama, rowMenu.kode, row.grup2)} key={rowMenu.urut}>{rowMenu.nama}</span>
                                ))}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>


                <div className='text-center my-5'>
                    <Button className='d-inline-block nav-item btnToggleSidebar' variant='primary' onClick={() => this.handleShowSidebar()}>
                        <i className="fa-solid fa-angle-left"></i>
                    </Button>
                </div>
            </div>

        )
    }

    Topbar = () => {
        return (
            <div className='topbar shadow mb-4'>
                <div className='d-inline-block w-25 text-start'>
                    <Button variant='light' onClick={() => this.handleShowSidebar()} title='Sembunyikan Menu'>
                        <i className="fa-solid fa-bars"></i>
                    </Button> &nbsp;

                    <Button type='button' variant='light' className='d-inline-block' title='Tutup menu aktif' onClick={() => this.handleCloseMenu()}>
                        <i className="fa-solid fa-xmark text-danger"></i>
                    </Button> &nbsp;

                    <Button type='button' variant='light' className='d-inline-block' title='Tutup semua menu' onClick={() => this.handleCloseAllMenu()}>
                        <i className="fa-solid fa-square-xmark text-danger"></i>
                    </Button> &nbsp;
                </div>

                <div className='d-inline-block w-50 align-middle justify-content-center'>
                    <div className='d-inline-block w-50 p-2'>
                        <span className='text-truncate'>Pencapaian Pengiriman :</span>
                        <ProgressBar variant="danger" animated now={20} label='20%' />
                    </div>

                    <div className='d-inline-block w-50 p-2'>
                        <span className='text-truncate'>Pencapaian Penjualan :</span>
                        <ProgressBar variant="info" animated now={50} label='50%' />
                    </div>

                </div>

                <div className='d-inline-block w-25 text-end'>
                    <Button variant='light' onClick={() => this.setState({ modalShow: true })} title='Logout'>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </Button>
                </div>
            </div>

        )
    }

    Menu = ({ name, approval }) => {
        if (Components[name]) {
            if (this.state.errorInfo && this.state.errorMenu === name) {
                console.log('error menu : ' + this.state.errorMenu + ' menu to open : ' + name)
                return (
                    <>
                        <span className='text-danger'>{this.state.error.toString()}</span>
                        <br />
                        <span className='text-info'>
                            {this.state.errorInfo.componentStack.toString()}
                        </span>
                    </>

                )
            } else {
                const Component = Components[name]
                return (<Component approval={approval} />)
            }
        } else {
            return (
                <h5>Menu {name} belum dibuat</h5>
            )
        }
    }

    render() {
        if (!this.state.token) {
            return (<Navigate to='/login' replace />)
        }

        return (
            <div className='d-flex'>
                <this.Sidebar />

                <div className='content-wrapper d-flex flex-column'>
                    <this.Topbar />

                    <div className='content'>
                        <Tabs id="controlled" activeKey={this.state.tabKey} onSelect={(k) => this.setState({ tabKey: k })}>
                            <Tab eventKey="home" title="Home" className='shadow p-2'>
                                <h5>Home</h5>
                            </Tab>

                            {this.state.openedMenus.map(menu => (
                                <Tab eventKey={menu.name} title={menu.title} key={menu.name} className='shadow p-2'>
                                    <this.Menu name={menu.name} approval={menu.approval} />

                                </Tab>
                            ))}
                            
                        </Tabs>
                    </div>
                </div>

                <GModal
                    show={this.state.modalShow}
                    type='question'
                    title='Logout'
                    body='Anda yakin akan keluar aplikasi'
                    onHide={() => this.setState({ modalShow: false })}
                    buttons={[
                        { text: 'Ya', onClick: () => this.handleLogout() },
                        { text: 'Tidak', onClick: null }
                    ]}
                />

            </div>
        )
    }
}