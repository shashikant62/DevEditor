import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../componets/Actions';
import Username from '../componets/Username';
import Editor from '../componets/Editor';
import CopyId from '../componets/CopyId';
import { initsocket } from '../componets/socketconnection';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomid } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    useEffect(() => {
        const init = async () => {
            socketRef.current = await initsocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomid,
                username: location.state?.username,
            });
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyroomid() {
        try {
            await navigator.clipboard.writeText(roomid);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className='Editorpage_conatiner'>
        <div className='inside_editor_container'>
            <div className='left_side_editorpage'>
                <div className='left_inside_Editor'>
                    <Username Clienname={clients}/>
                </div>
                <CopyId/>
            </div>
            <div className='right_side_editorpage'>
                <Editor socketref={socketRef} roomid={roomid} onCodeChange={(code) => {
                    codeRef.current = code;
                }}/>
            </div>
        </div>
    </div>
    );
};
export default EditorPage;