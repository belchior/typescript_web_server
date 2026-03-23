import { BrowserRouter, Routes, Route } from 'react-router'

import App from '../App/App'
import Home from '../../pages/home/Home'
// import NotFound from '../../pages/notfound/NotFound';
// import Profile from '../../pages/profile/Profile';

// interface IAppRouteProps {
//   children?: React.ReactNode
//   path: string
//   exact?: boolean
//   component?: React.ReactNode
// }

// const AppRoute = (props: IAppRouteProps) => {
//   const { children, component, ...routeProps } = props;
//   const Page: any = children ? () => children : component;

//   return (
//     <Route {...routeProps}>
//       <App>
//         <Page />
//       </App>
//     </Route>
//   );
// };

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App><Home /></App>} />
        {/* <Route path="/404" element={<App><NotFound /></App>} />
        <Route path="/:login([a-zA-Z]+[\w]+)" element={<App><Profile /></App>} />
        <Route path="/*" element={<App><NotFound /></App>} /> */}

        {/* <AppRoute path="/" exact component={Home} />
        <AppRoute path="/404" component={NotFound} />
        <AppRoute path="/:login([a-zA-Z]+[\w]+)" component={Profile} />
        <AppRoute path="*" component={NotFound} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default Router
