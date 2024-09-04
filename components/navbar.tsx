'use client';
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from '@nextui-org/react';
import { Link } from '@nextui-org/link';
import { siteConfig } from '@/config/site';
import NextLink from 'next/link';
import Me from '@/components/navbar/me';
import { ThemeSwitch } from '@/components/theme-switch';
import { TwitterIcon, GithubIcon, DiscordIcon, Logo } from '@/components/icons';
import { useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavContext } from '@/contexts/nav';

export const Navbar = () => {
  const { current, setCurrent } = useContext(NavContext);
  const pathname = usePathname();

  useEffect(() => {
    document
      .getElementById('drag-bar')
      ?.style.setProperty('-webkit-app-region', 'drag');
    const noDrag = document.getElementsByClassName('no-drag');
    for (let i = 0; i < noDrag.length; i++) {
      (noDrag[i] as HTMLElement).style.setProperty(
        '-webkit-app-region',
        'no-drag'
      );
    }
  }, []);

  useEffect(() => {
    setCurrent(pathname);
  }, [pathname, setCurrent]);

  return (
    <NextUINavbar
      maxWidth="full"
      height="50px"
      position="sticky"
      id="drag-bar"
      className="pl-16 border-b-1 dark:border-zinc-800 bg-primary-500 dark:bg-primary-50"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink
            onClick={() => {
              setCurrent('/');
            }}
            className="flex justify-start items-center gap-1 no-drag"
            href="/"
          >
            <Logo />
          </NextLink>
        </NavbarBrand>
        <ul className="hidden sm:flex gap-4 justify-start ml-2 no-drag">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href} isActive={current === item.href}>
              <NextLink
                className={`text-white ${current === item.href ? 'border-b-2 pb-2 text-base' : ''}`}
                onClick={() => setCurrent(item.href)}
                color="foreground"
                target={'_self'}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
          {pathname === '/settings' && (
            <NavbarItem isActive={current === '/settings'}>
              <NextLink
                className={`text-white ${current === '/settings' ? 'border-b-2 pb-2 text-base' : ''}`}
                onClick={() => setCurrent('/settings')}
                color="foreground"
                target={'_self'}
                href="/settings"
              >
                Settings
              </NextLink>
            </NavbarItem>
          )}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2 no-drag">
          <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
            <TwitterIcon className="text-white" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
            <DiscordIcon className="text-white" />
          </Link>
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-white" />
          </Link>
          <ThemeSwitch />
          <Me />
        </NavbarItem>
        <NavbarItem className="hidden md:flex"></NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link
          className="no-drag"
          isExternal
          href={siteConfig.links.github}
          aria-label="Github"
        >
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch className="no-drag" />
        <NavbarMenuToggle className="no-drag" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2 no-drag">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={'foreground'}
                href={item.href}
                isExternal={item.external}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
