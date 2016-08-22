//动效
import React from 'react';

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            btnData : [
                {"name":"运动","class":"sports-btn"}
                , {"name":"3D旋转","class":"rotation-btn"}
                , {"name":"动效","class":"dx-btn"}
                , {"name":"缓动","class":"easing-btn"}
                , {"name":"物理世界","class":"physical-btn"}
                , {"name":"物体","class":"object-btn"}
                , {"name":"碰撞探测器","class":"collision-btn"}
            ]
        };
    }

    render() {
        return (
            <div className="Animation">
                {
                    this.state.btnData.map((v,i)=>{
                        return <button key={i} className={ "btn btn-clear " + v.class } title={v.name} />
                    })
                }
            </div>
        );
    }
}

module.exports = Animation;
